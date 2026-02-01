"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getRedirectResult, UserCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
    loginEmail,
    signupEmail,
    loginGoogleAuto,
    logoutFull
} from "../lib/authActions";
import { User, TEAMS, TeamProfile } from "../types/auth";
import { PlayerProfile, TeamId } from "../types/store";

type AuthCtx = {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    authLoading: boolean;
    roleLoading: boolean;
    loading: boolean;

    loginEmail: (email: string, password: string) => Promise<void>;
    signupEmail: (email: string, password: string) => Promise<void>;
    loginGoogle: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
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
    'tout': '1234', 'ankh': '1234', 'amon': '1234', 'ra': '1234', 'uncle_joy': '1234'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [activeTeam, setActiveTeam] = useState<TeamProfile | null>(null);

    // Initial loading state MUST be true to block any routing until Firebase speaks
    const [authLoading, setAuthLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(false); // Starts false, becomes true if user found

    // --- 1. GLOBAL INITIALIZATION ---
    useEffect(() => {
        let unsubscribe: () => void;

        const initAuth = async () => {
            console.log("🔐 [AUTH] Initializing...");
            setAuthLoading(true);

            // A. Handle Redirect Result (Critical for PWA)
            try {
                const redirectResult = await getRedirectResult(auth);
                if (redirectResult) {
                    console.log("🔁 [AUTH] Redirect Login Detected:", redirectResult.user.email);
                    // No further action needed here; onAuthStateChanged will fire with this user immediately after.
                }
            } catch (e: any) {
                console.error("❌ [AUTH] Redirect Result Error:", e);
                // We don't block; we just log. User can try logging in again if it failed.
            }

            // B. Listen for Auth Changes
            unsubscribe = onAuthStateChanged(auth, async (fUser) => {
                console.log("👤 [AUTH] Change Detected:", fUser?.email || "Guest");

                if (!fUser) {
                    // LOGGED OUT
                    setFirebaseUser(null);
                    setUser(null);
                    setActiveTeam(null);
                    setAuthLoading(false);
                    setRoleLoading(false);
                    return;
                }

                // LOGGED IN
                setFirebaseUser(fUser);
                setAuthLoading(false); // Firebase knows who we are
                setRoleLoading(true);  // Now fetching local profile

                try {
                    const ref = doc(db, "users", fUser.uid);
                    const snap = await getDoc(ref);

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
                        // Use setDoc with merge to be safe, though snap !exists implies purely new
                        await setDoc(ref, userData);
                    } else {
                        console.log("✅ [AUTH] Profile Loaded");
                        await updateDoc(ref, { lastLogin: serverTimestamp() });
                        userData = snap.data();
                    }

                    // Map to App User
                    const appUser: User = {
                        id: fUser.uid,
                        name: userData.name || userData.displayName || fUser.displayName || "User",
                        email: fUser.email || "",
                        role: (userData.role === 'admin' || userData.role === 'ADMIN') ? 'ADMIN' : 'USER',
                        avatar: userData.photoURL || fUser.photoURL || "",
                        isDisabled: userData.isDisabled === true,
                        teamId: userData.teamId,
                        isOnboarded: !!userData.teamId
                    };

                    setUser(appUser);

                    if (appUser.teamId) {
                        const t = TEAMS.find(team => team.id === appUser.teamId);
                        if (t) setActiveTeam(t);
                    }

                } catch (err) {
                    console.error("❌ [AUTH] Profile Fetch Error:", err);
                    // Fallback so user isn't stuck endlessly loading
                    setUser({
                        id: fUser.uid,
                        name: fUser.displayName || "User",
                        role: 'USER',
                        email: fUser.email || "",
                        idAsString: fUser.uid // legacy
                    } as any);
                } finally {
                    setRoleLoading(false);
                }
            });
        };

        initAuth();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const isAdmin = user?.role === 'ADMIN' || user?.teamId === 'uncle_joy';
    const loading = authLoading || roleLoading;

    // Actions
    const handleLoginGoogle = async () => {
        // This function will handle PWA redirect checks internally
        await loginGoogleAuto();
        // NOTE: If redirect happens, this promise chain halts here as page reloads.
        // If popup happens, it continues.
    };

    const selectTeam = async (teamId: string, pin: string): Promise<boolean> => {
        if (!firebaseUser) return false;
        if (TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) return false;

        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), { teamId });
            setUser(prev => prev ? { ...prev, teamId: teamId as TeamId } : null);
            const t = TEAMS.find(x => x.id === teamId);
            if (t) setActiveTeam(t);
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
        loading,
        loginEmail,
        signupEmail,
        loginGoogle: handleLoginGoogle,
        loginWithGoogle: handleLoginGoogle,
        logout: logoutFull,
        activeTeam,
        selectedTeam: activeTeam,
        isAdmin,
        selectTeam,
        hasAccess: () => true,
        login: async (e, p) => { try { await loginEmail(e, p); return true; } catch { return false; } },
        activePlayer: user,
        TEAMS
    };

    // BLOCKING LOADER (Global)
    // We block the entire app during the initial Auth Check (authLoading).
    // This prevents "Login Page" flash for PWA users who are actually logged in.
    if (authLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070A0F] text-accent-gold">
                <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mb-4" />
                <div className="text-xl font-bold tracking-widest animate-pulse">SOBEK PLAY</div>
                <p className="mt-4 text-xs text-gray-500 font-mono tracking-widest">AUTHENTICATING...</p>
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
