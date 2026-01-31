"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getIdTokenResult } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, setDoc, updateDoc, getDocs, serverTimestamp, increment, runTransaction, writeBatch } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
    handleGoogleRedirectResult,
    loginEmail,
    signupEmail,
    loginGoogleAuto,
    logoutFull,
} from "../lib/authActions";
import { ScoreState, User, TEAMS, TeamProfile } from "../types/auth";
import { AccountData, PlayerProfile, TeamScore, TeamId } from "../types/store";
import { ACHIEVEMENTS_LIST } from "../pages/AchievementsPage";

type AuthCtx = {
    // Auth State
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;

    // Core Actions
    loginEmail: (email: string, password: string) => Promise<void>;
    signupEmail: (email: string, password: string) => Promise<void>;
    loginGoogle: () => Promise<void>;
    loginWithGoogle: () => Promise<void>; // Alias for consistency
    logout: () => Promise<void>;

    // Data State
    activePlayer: PlayerProfile | null;
    accountData: AccountData | null;
    allPlayers: PlayerProfile[];
    activeTeam: TeamProfile | null;

    // Logic
    isAdmin: boolean;
    selectTeam: (teamId: string, pin: string) => Promise<boolean>;
    addPoints: (target: 'player' | 'team' | 'account', id: string, amount: number) => Promise<void>;
    addTeamPoints: (teamId: string, amount: number) => Promise<void>;
    setPoints: (target: 'player' | 'team', id: string, newValue: number) => Promise<void>;
    resetSystemPoints: () => Promise<void>;

    // Compatibility
    selectedTeam: TeamProfile | null; // Alias for activeTeam
    gamification: ScoreState;
    updateScore: (username: string, delta: number) => void; // mapped to addPoints
    hasAccess: (feature: string) => boolean;
    login: (email: string, password: string) => Promise<boolean>;
    TEAMS: TeamProfile[]; // Exposed for Admin Pages
};

const Ctx = createContext<AuthCtx | null>(null);

const TEAM_PINS: Record<string, string> = {
    'tout': '1234',
    'ankh': '1234',
    'amon': '1234',
    'ra': '1234',
    'uncle_joy': '1234'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Sobek Data State
    const [activePlayer, setActivePlayer] = useState<PlayerProfile | null>(null);
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
    const [activeTeam, setActiveTeam] = useState<TeamProfile | null>(null);

    // Initial Redirect Handling
    useEffect(() => {
        handleGoogleRedirectResult().catch((err) => console.error("Google Redirect Error", err));
    }, []);

    // 1. Global Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setFirebaseUser(currentUser);

                // Basic User Mapping
                setUser({
                    id: currentUser.uid,
                    name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                    email: currentUser.email || "",
                    role: 'USER', // Role now determined by Active Team (Uncle Joy)
                    avatar: currentUser.photoURL || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
                });

            } else {
                setFirebaseUser(null);
                setUser(null);
                setActivePlayer(null);
                setActiveTeam(null);
                setAccountData(null);
                setAllPlayers([]);
                localStorage.removeItem('sobek_active_player_id');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Data Subscriptions (Only when logged in)
    useEffect(() => {
        if (!firebaseUser) return;

        // Subscribe to 'users' collection for the MAIN profile
        const userRef = doc(db, "users", firebaseUser.uid);
        const subUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Merge Firestore data into our User state
                setUser(prev => prev ? {
                    ...prev,
                    name: data.name || prev.name,
                    mobile: data.mobile || '',
                    avatar: data.avatarUrl || prev.avatar,
                    role: (data.role === 'admin' || data.role === 'ADMIN' || data.isAdmin) ? 'ADMIN' : (prev.role || 'USER')
                } : null);

                // Update Active Player State
                setActivePlayer(prev => prev ? { ...prev, personalPoints: data.personalPoints || 0 } : null);

                // Also Load Active Team if set in User Doc
                if (data.teamId) {
                    const t = TEAMS.find(team => team.id === data.teamId);
                    if (t) setActiveTeam(t);
                }

                // Daily Bonus Logic
                const now = new Date();
                const lastLoginDate = data.lastLogin ? (data.lastLogin as any).toDate() : null;
                const isNewDay = !lastLoginDate || lastLoginDate.getDate() !== now.getDate() || lastLoginDate.getMonth() !== now.getMonth();

                if (isNewDay) {
                    // Grant Reward
                    const streak = (data.dailyStreak || 0) + 1;
                    const rewardPoints = 50 + (streak * 10);

                    // Helper to trigger UI
                    const triggerReward = () => {
                        window.dispatchEvent(new CustomEvent('daily-reward', {
                            detail: { points: rewardPoints, streak: streak }
                        }));
                    };

                    // Update DB
                    updateDoc(userRef, {
                        lastLogin: serverTimestamp(),
                        dailyStreak: streak,
                        personalPoints: increment(rewardPoints)
                    }).then(() => {
                        triggerReward();
                        // Also update team points if user has team
                        if (data.teamId) {
                            updateDoc(doc(db, "teams", data.teamId), {
                                totalPoints: increment(rewardPoints)
                            });
                        }
                    });
                }
            } else {
                // Initialize User Doc if missing
                setDoc(userRef, {
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email,
                    avatarUrl: firebaseUser.photoURL,
                    personalPoints: 0,
                    teamId: 'tout', // Default
                    lastLogin: serverTimestamp(),
                    dailyStreak: 1,
                    createdAt: serverTimestamp(),
                    isAdmin: false
                }, { merge: true });
            }
        });

        // Team Subscription (Listen to ALL teams to update UI instantly)
        const subTeams = onSnapshot(collection(db, "teams"), (snap) => {
            if (activeTeam) {
                const updatedTeamDoc = snap.docs.find(d => d.id === activeTeam.id);
                if (updatedTeamDoc) {
                    setActiveTeam(prev => prev ? { ...prev, ...updatedTeamDoc.data() } : null);
                }
            }
        });

        // B. Players Subscription (Users Collection)
        // If we want to see everyone (Admin View), query everyone.
        // If not admin, Firestore Rules will block this query or return error.
        // For now, let's Listen to ALL users. 
        // In production, we'd conditionalize this based on `isAdmin` state, 
        // but `isAdmin` is derived from `activeTeam`.

        const subPlayers = onSnapshot(collection(db, "users"), (snap) => {
            const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerProfile));
            setAllPlayers(loaded);
        }, (error) => {
            // Likely permission denied if not admin
            // console.log("Not admin or permission denied to view all users");
        });

        return () => {
            subUser();
            subTeams();
            subPlayers();
        };
    }, [firebaseUser, activeTeam?.id]);

    // 2.5: Achievement Unlocker Listener
    useEffect(() => {
        if (!activeTeam || !activeTeam.totalPoints) return;

        ACHIEVEMENTS_LIST.forEach(async (ach) => {
            if ((activeTeam.totalPoints || 0) >= ach.threshold) {
                // Check if already unlocked (Needs a read or smart write)
                // We use setDoc with merge to be idempotent without reading first
                const achRef = doc(db, `teams/${activeTeam.id}/achievements`, ach.id);
                try {
                    // Check existence to prevent spamming writes (optional but good)
                    // Here we just write because Firestore handles idempotency well for simple sets
                    await setDoc(achRef, {
                        unlocked: true,
                        unlockedAt: serverTimestamp()
                    }, { merge: true });
                } catch (e) {
                    console.error("Unlock Error", e);
                }
            }
        });
    }, [activeTeam?.totalPoints, activeTeam?.id]);

    // 3. Derived Admin State
    const isAdmin = user?.role === 'ADMIN' || activeTeam?.id === 'uncle_joy';

    // 4. Team Selection Logic (Transactional Switch)
    const selectTeam = async (teamId: string, pin: string): Promise<boolean> => {
        const correctPin = TEAM_PINS[teamId];
        if (pin !== correctPin) return false;
        if (!firebaseUser) return false;

        const userId = firebaseUser.uid;
        const targetTeamRef = doc(db, "teams", teamId);
        const userRef = doc(db, "users", userId);

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Get current user data to see old team & points
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) throw "User not found";

                const userData = userSnap.data();
                const currentTeamId = userData.teamId;
                const userPoints = userData.personalPoints || 0;

                // 2. Decrement Old Team (if exists and different)
                if (currentTeamId && currentTeamId !== teamId) {
                    const oldTeamRef = doc(db, "teams", currentTeamId);
                    transaction.update(oldTeamRef, {
                        totalPoints: increment(-userPoints)
                    });
                }

                // 3. Increment New Team
                // Use set with merge to ensure team doc exists
                transaction.set(targetTeamRef, {
                    totalPoints: increment(userPoints),
                    id: teamId // Critical: Ensure ID is preserved
                }, { merge: true });

                // 4. Update User
                transaction.update(userRef, {
                    teamId: teamId
                });
            });

            // Manually set active team for instant feedback
            const t = TEAMS.find(tm => tm.id === teamId);
            if (t) setActiveTeam(t);
            return true;
        } catch (e) {
            console.error("Selection failed", e);
            return false;
        }
    };

    // 5. Atomic Points Logic
    const addPoints = async (target: 'player' | 'team' | 'account', id: string, amount: number) => {
        // Allow if user is admin, even if activeTeam is not fully set (though it should be for Uncle Joy)
        if (!firebaseUser) return;

        try {
            await runTransaction(db, async (transaction) => {
                if (target === 'player') {
                    const userDocRef = doc(db, "users", id);
                    transaction.update(userDocRef, {
                        personalPoints: increment(amount),
                        updatedAt: serverTimestamp()
                    });

                    const userDoc = await transaction.get(userDocRef);
                    if (userDoc.exists()) {
                        const tId = userDoc.data().teamId;
                        if (tId) {
                            const teamRef = doc(db, "teams", tId);
                            // Ensure the team doc exists or update it
                            transaction.set(teamRef, {
                                totalPoints: increment(amount),
                                id: tId
                            }, { merge: true });

                            // Log
                            const logRef = doc(collection(db, "points_logs"));
                            transaction.set(logRef, {
                                userId: id,
                                teamId: tId,
                                points: amount,
                                actionBy: isAdmin ? 'admin' : 'game',
                                reason: 'player_update',
                                createdAt: serverTimestamp()
                            });
                        }
                    }

                } else if (target === 'team') {
                    const teamDocRef = doc(db, "teams", id);
                    transaction.set(teamDocRef, {
                        totalPoints: increment(amount)
                    }, { merge: true });
                }
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
        }
    };

    // 6. Bulk Team Points
    const addTeamPoints = async (teamId: string, amount: number) => {
        if (!isAdmin) return;

        try {
            // 1. Update Team Total
            await updateDoc(doc(db, "teams", teamId), {
                totalPoints: increment(amount)
            });

            // 2. Fetch all users in team
            const q = query(collection(db, "users"), where("teamId", "==", teamId));
            const snapshot = await getDocs(q);

            // 3. Batch Update Users
            const batch = writeBatch(db);
            snapshot.docs.forEach(d => {
                batch.update(d.ref, { personalPoints: increment(amount) });
            });

            // Add Log
            const logRef = doc(collection(db, "points_logs"));
            batch.set(logRef, {
                teamId: teamId,
                points: amount,
                actionBy: 'admin',
                reason: 'team_bulk_update',
                userCount: snapshot.size,
                createdAt: serverTimestamp()
            });

            await batch.commit();
            console.log(`Updated ${snapshot.size} users`);

        } catch (e) {
            console.error("Bulk update failed", e);
        }
    };

    const setPoints = async (target: 'player' | 'team', id: string, newValue: number) => {
        if (!isAdmin) return;

        try {
            await runTransaction(db, async (transaction) => {
                if (target === 'player') {
                    const userDocRef = doc(db, "users", id);
                    const userSnap = await transaction.get(userDocRef);
                    if (!userSnap.exists()) throw "User not found";

                    const oldPoints = userSnap.data().personalPoints || 0;
                    const delta = newValue - oldPoints;
                    const tId = userSnap.data().teamId;

                    // Update User
                    transaction.update(userDocRef, {
                        personalPoints: newValue,
                        updatedAt: serverTimestamp()
                    });

                    // Update Team
                    if (tId) {
                        const teamRef = doc(db, "teams", tId);
                        transaction.set(teamRef, {
                            totalPoints: increment(delta)
                        }, { merge: true });

                        // Log
                        const logRef = doc(collection(db, "points_logs"));
                        transaction.set(logRef, {
                            userId: id,
                            teamId: tId,
                            points: delta,
                            oldValue: oldPoints,
                            newValue: newValue,
                            actionBy: 'admin',
                            reason: 'admin_reset_set',
                            createdAt: serverTimestamp()
                        });
                    }
                } else if (target === 'team') {
                    // Reset Team Directly (Does not affect users, just the team aggregate if that's what is desired, 
                    // OR calculating from users? 
                    // Usually "Reset Team Score" implies setting the team's totalPoints to X. 
                    // In this system, Team Points are loosely coupled (sum + bonuses). 
                    // So we just set the value.
                    const teamRef = doc(db, "teams", id);
                    transaction.update(teamRef, {
                        totalPoints: newValue
                    });

                    // Log
                    const logRef = doc(collection(db, "points_logs"));
                    transaction.set(logRef, {
                        teamId: id,
                        newValue: newValue,
                        actionBy: 'admin',
                        reason: 'admin_team_reset',
                        createdAt: serverTimestamp()
                    });
                }
            });
            console.log("Points reset successfully");
        } catch (e) {
            console.error("Set Points Failed", e);
        }
    };

    const resetSystemPoints = async () => {
        if (!isAdmin) return;

        try {
            // 1. Reset All Teams to 0
            const teamBatch = writeBatch(db);
            const teamsSnap = await getDocs(collection(db, "teams"));
            teamsSnap.docs.forEach(d => {
                teamBatch.update(d.ref, { totalPoints: 0 });
            });
            await teamBatch.commit();

            // 2. Reset All Users to 0 (Chunked Batches if > 500 users, assuming < 500 for now or simple approach)
            // For robustness with strictly <500 users in this context:
            const usersSnap = await getDocs(collection(db, "users"));
            const userBatch = writeBatch(db);

            usersSnap.docs.forEach(d => {
                userBatch.update(d.ref, {
                    personalPoints: 0,
                    dailyStreak: 0 // Optional: Reset streak too? Let's keep streak, just reset score.
                    // If "Season Reset", usually points only.
                });
            });
            await userBatch.commit();

            // Log
            await setDoc(doc(collection(db, "points_logs")), {
                actionBy: 'admin',
                reason: 'GLOBAL_RESET',
                createdAt: serverTimestamp()
            });

            console.log("GLOBAL RESET COMPLETE");
        } catch (e) {
            console.error("Global Reset Failed", e);
            throw e;
        }
    };

    const value = useMemo<AuthCtx>(() => ({
        user,
        firebaseUser,
        loading,
        activePlayer,
        accountData,
        allPlayers,
        activeTeam,
        isAdmin,
        selectTeam,
        addPoints,
        addTeamPoints,
        setPoints,
        resetSystemPoints, // New Global Reset

        // Legacy shims
        selectedTeam: activeTeam,
        gamification: {},
        updateScore: (u, d) => activePlayer ? addPoints('player', activePlayer.id, d) : null,
        hasAccess: (f) => isAdmin || f !== 'admin_dashboard',

        loginEmail: async (email, password) => { await loginEmail(email, password); },
        signupEmail: async (email, password) => { await signupEmail(email, password); },
        loginGoogle: async () => { await loginGoogleAuto(); },
        loginWithGoogle: async () => { await loginGoogleAuto(); },
        login: async (email, pass) => { try { await loginEmail(email, pass); return true; } catch { return false; } },
        logout: async () => {
            setActivePlayer(null);
            setActiveTeam(null);
            setFirebaseUser(null);
            localStorage.clear();
            await logoutFull();
        },
        TEAMS // Expose constant
    }), [user, firebaseUser, loading, activePlayer, accountData, allPlayers, activeTeam, isAdmin]);

    // Prevent rendering until Auth is resolved (Fixes Black Screen / Redirect loops)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#070A0F] text-accent-gold">
                <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mb-4" />
                <div className="text-xl font-bold tracking-widest animate-pulse">SOBEK PLAY Loading...</div>
            </div>
        );
    }

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const context = useContext(Ctx);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
