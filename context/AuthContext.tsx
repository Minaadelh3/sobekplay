"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getRedirectResult, UserCredential, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { authService } from "@/lib/AuthService";
import { User, TEAMS, TeamProfile } from "../types/auth";
import { PlayerProfile, TeamId } from "../types/store";

type AuthCtx = {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    authLoading: boolean;
    roleLoading: boolean;
    authReady: boolean;
    roleReady: boolean;
    loading: boolean;

    loginEmail: (email: string, password: string) => Promise<UserCredential>;
    signupEmail: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;

    // Data & Logic
    activeTeam: TeamProfile | null;
    selectedTeam: TeamProfile | null;
    isAdmin: boolean;
    selectTeam: (teamId: string, pin: string) => Promise<boolean>;
    hasAccess: (feature: string) => boolean;

    // Legacy
    login: (email: string, password: string) => Promise<boolean>;
    activePlayer: any;
    TEAMS: TeamProfile[];
};

const Ctx = createContext<AuthCtx | null>(null);

const TEAM_PINS: Record<string, string> = {
    'tout': '1234', 'ptah': '1234', 'amon': '1234', 'ra': '1234', 'uncle_joy': '1234'
};

// Global Log Buffer for PWA Debugging
declare global {
    interface Window {
        __SOBEK_LOGS__: string[];
    }
}
if (typeof window !== 'undefined') {
    window.__SOBEK_LOGS__ = window.__SOBEK_LOGS__ || [];
}

const log = (msg: string) => {
    console.log(msg);
    if (typeof window !== 'undefined') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${msg}`;
        window.__SOBEK_LOGS__.push(logEntry);

        // Persist to LocalStorage for PWA Debugging (survives reload)
        try {
            const existing = JSON.parse(localStorage.getItem('__SOBEK_LOGS__') || '[]');
            existing.push(logEntry);
            // Keep last 50 logs only
            if (existing.length > 50) existing.shift();
            localStorage.setItem('__SOBEK_LOGS__', JSON.stringify(existing));
        } catch (e) { /* ignore */ }
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [activeTeam, setActiveTeam] = useState<TeamProfile | null>(null);

    // Initial loading state MUST be true to block any routing until Firebase speaks
    const [authLoading, setAuthLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(false); // Starts false, becomes true if user found

    // Stable Readiness Flags
    const [authReady, setAuthReady] = useState(false);
    const [roleReady, setRoleReady] = useState(false);

    // --- 1. GLOBAL INITIALIZATION ---

    useEffect(() => {
        let authUnsub: (() => void) | undefined;
        let profileUnsub: (() => void) | undefined;

        // --- 1. GLOBAL INITIALIZATION ---
        log("🔐 [AUTH] Initializing AuthProvider v2.3 (Realtime Fix)...");
        setAuthLoading(true);

        if (!auth) {
            log("⚠️ [AUTH] Firebase Auth not initialized.");
            setAuthLoading(false);
            return;
        }

        // Check Redirect (Non-blocking side effect)
        getRedirectResult(auth).catch(e => console.error("Auth Redirect Error", e));

        // B. Listen for Auth Changes (IMMEDIATE)
        authUnsub = onAuthStateChanged(auth, async (fUser) => {
            // 1. Cleanup previous profile listener if user switches
            if (profileUnsub) {
                profileUnsub();
                profileUnsub = undefined;
            }

            console.log("👤 [AUTH] Change Detected:", fUser?.email || "Guest");

            if (!fUser) {
                // LOGGED OUT
                setFirebaseUser(null);
                setUser(null);
                setActiveTeam(null);
                setRoleLoading(false);
                setAuthLoading(false);
                setAuthReady(true);
                setRoleReady(true);
                return;
            }

            // LOGGED IN
            setFirebaseUser(fUser);
            setRoleLoading(true);

            // 2. Setup Real-time Profile Listener
            const ref = doc(db, "users", fUser.uid);

            profileUnsub = onSnapshot(ref, async (snap) => {
                let userData: any;

                if (!snap.exists()) {
                    console.log("🆕 [AUTH] Creating New Profile...");
                    userData = {
                        uid: fUser.uid,
                        email: fUser.email || "",
                        displayName: fUser.displayName || "New User",
                        role: "USER",
                        status: "active",
                        teamId: null,
                        provider: fUser.providerData[0]?.providerId || 'unknown',
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        photoURL: fUser.photoURL || ""
                    };
                    await setDoc(ref, userData);

                    // TRACK EVENT: USER_CREATED
                    // We use a dynamic import to avoid circular deps if any
                    import('../lib/events').then(m => m.trackEvent(fUser.uid, 'USER_CREATED', {
                        provider: userData.provider,
                        email: userData.email
                    }));
                } else {
                    // console.log("✅ [AUTH] Profile Update Received");
                    userData = snap.data();


                    // 🔄 SYNC: Ensure PhotoURL is up to date if missing in DB but present in Auth
                    // This fixes the Avatar issue in Rankings
                    if (!userData.photoURL && fUser.photoURL) {
                        console.log("🔄 [AUTH] Syncing PhotoURL to Firestore...");
                        await updateDoc(ref, { photoURL: fUser.photoURL });
                    }

                    // 📅 DAILY LOGIN TRACKER
                    const now = new Date();
                    const lastLogin = userData.lastLogin?.toDate ? userData.lastLogin.toDate() : new Date(0);
                    const isNewDay = now.getDate() !== lastLogin.getDate() || now.getMonth() !== lastLogin.getMonth();

                    if (isNewDay) {
                        import('../lib/events').then(m => {
                            m.trackEvent(fUser.uid, 'DAILY_LOGIN');

                            // Streak Logic could be here or backend. 
                            // Let's send STREAK event so backend calculates it strictly.
                            m.trackEvent(fUser.uid, 'LOGIN_STREAK');
                        });

                        // Update lastLogin to now preventing double trigger
                        await updateDoc(ref, { lastLogin: serverTimestamp() });
                    }
                }

                // Map to App User
                const appUser: User = {
                    id: fUser.uid,
                    name: userData.nickname || userData.name || userData.displayName || fUser.displayName || "User", // Prefer Nickname
                    email: fUser.email || "",
                    role: (userData.role === 'admin' || userData.role === 'ADMIN') ? 'ADMIN' : 'USER',
                    avatar: userData.avatarUrl || userData.photoURL || fUser.photoURL || "",
                    isDisabled: userData.isDisabled === true,
                    teamId: userData.teamId,
                    isOnboarded: userData.isOnboarded === true || !!userData.teamId,

                    // New Settings Architecture Mapping
                    profile: userData.profile || {},
                    preferences: userData.preferences || {},
                    privacy: userData.privacy || {},
                    notifications: userData.notifications || {},
                    createdAt: userData.createdAt,

                    // Gamification Mapping
                    xp: userData.xp || 0,
                    level: userData.level || 1,
                    unlockedAchievements: userData.unlockedAchievements || [],
                    achievementProgress: userData.achievementProgress || {},
                    lastDailyAction: userData.lastDailyAction || {}
                };

                // Backwards Compat / Priority Logic for Display Fields
                // 1. profile.displayName -> 2. userData.nickname -> 3. userData.name -> 4. Auth.displayName
                appUser.name = userData.profile?.displayName || userData.nickname || userData.name || userData.displayName || fUser.displayName || "User";

                // 1. profile.photoURL -> 2. userData.avatarUrl -> 3. Auth.photoURL
                appUser.avatar = userData.profile?.photoURL || userData.avatarUrl || userData.photoURL || fUser.photoURL || "";

                // 1. profile.mobile -> 2. userData.mobile
                appUser.mobile = userData.profile?.mobile || userData.mobile;

                setUser(appUser);

                // Team Logic
                // We REMOVED the one-time fetch here because the new useEffect handles real-time updates based on user.teamId
                // This prevents double-fetching and ensures data is always fresh.

                setRoleLoading(false);
                setRoleReady(true);

                // CRITICAL FIX: Do NOT set Auth Ready if we have a team ID.
                // Wait for the Team Listener to fire first.
                // This prevents ProtectedRoute from seeing "No Team" momentarily and redirecting to /profiles
                if (!appUser.teamId) {
                    setAuthLoading(false);
                    setAuthReady(true);
                } else {
                    log(`⏳ [AUTH] User has team (${appUser.teamId}), waiting for Team Listener...`);
                }
            }, (err) => {
                console.error("❌ [AUTH] Profile Snapshot Error:", err);
                setRoleLoading(false);
                setAuthLoading(false);
            });
        });

        return () => {
            if (authUnsub) authUnsub();
            if (profileUnsub) profileUnsub();
        };
    }, []);

    // --- 2. TEAM REAL-TIME LISTENER ---
    useEffect(() => {
        let teamUnsub: () => void;

        if (user?.teamId) {
            // If user has a team, listen to it
            const teamRef = doc(db, "teams", user.teamId);
            teamUnsub = onSnapshot(teamRef, (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setActiveTeam(prev => ({
                        ...prev,
                        id: user.teamId as TeamId,
                        ...data,
                        points: data.xp || data.points || 0 // Prefer XP, fallback to points
                    } as TeamProfile));
                }

                // FORCE READY (Fix for Redirect Issue)
                // Once we have the team (or failed to get it), we are ready.
                setAuthLoading(false);
                setAuthReady(true);
            }, (err) => {
                console.error("❌ [AUTH] Team Snapshot Error:", err);
            });
        } else {
            setActiveTeam(null);
        }

        return () => {
            if (teamUnsub) teamUnsub();
        };
    }, [user?.teamId]);

    const isAdmin = user?.role === 'ADMIN' || user?.teamId === 'uncle_joy';
    const loading = authLoading || roleLoading;

    // Actions


    const selectTeam = async (teamId: string, pin: string): Promise<boolean> => {
        if (!firebaseUser) return false;

        // 1. Check Firestore for dynamic PIN first
        try {
            const teamDoc = await getDoc(doc(db, "teams", teamId));
            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                // If team has a PIN set in DB, verify it
                if (teamData.pin && teamData.pin.toString().toLowerCase() !== pin.toLowerCase()) {
                    return false;
                }
                // If it doesn't have a PIN in DB, fallback to static TEAM_PINS
                if (!teamData.pin && TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) {
                    return false;
                }
            } else if (TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) {
                // Fallback for non-existent team docs (static teams)
                return false;
            }
        } catch (e) {
            console.error("Error fetching team PIN", e);
            // Fallback to static PINS on error
            if (TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) return false;
        }

        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), { teamId });
            setUser(prev => prev ? { ...prev, teamId: teamId as TeamId } : null);

            // TRACK EVENT: TEAM_JOINED
            import('../lib/events').then(m => m.trackEvent(firebaseUser.uid, 'TEAM_JOINED', { teamId }));

            // Update Active Team State Logic
            const staticTeam = TEAMS.find(x => x.id === teamId);
            if (staticTeam) {
                setActiveTeam(staticTeam);
            } else {
                // Dynamic Fetch for immediate UI update
                const teamDoc = await getDoc(doc(db, "teams", teamId));
                if (teamDoc.exists()) {
                    setActiveTeam({ id: teamId, ...teamDoc.data() } as TeamProfile);
                }
            }
            return true;
        } catch (e) {
            console.error("Team Select Error", e);
            return false;
        }
    };

    const value: AuthCtx = {
        user,
        firebaseUser,
        authLoading,
        roleLoading,
        authReady,
        roleReady,
        loading,
        loginEmail: (e, p) => authService.loginEmail(e, p),
        signupEmail: (e, p) => authService.signupEmail(e, p),
        logout: () => authService.logout(),
        activeTeam,
        selectedTeam: activeTeam,
        isAdmin,
        selectTeam,
        hasAccess: () => true,
        login: async (e, p) => { try { await authService.loginEmail(e, p); return true; } catch { return false; } },
        activePlayer: user,
        TEAMS
    };

    // BLOCKING LOADER (Global)
    // Branded Loading Screen - Logo Only, No Text
    if (authLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070A0F]">
                {/* Logo with subtle pulse animation */}
                <div className="relative">
                    {/* Glow effect behind */}
                    <div className="absolute inset-0 bg-accent-gold/20 blur-3xl rounded-full animate-pulse" />
                    <img
                        src="/assets/brand/logo.png"
                        alt="Sobek Play"
                        className="w-24 md:w-32 object-contain relative z-10 animate-fade-in"
                    />
                </div>
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
