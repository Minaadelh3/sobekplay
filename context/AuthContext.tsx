"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
    loginEmail,
    signupEmail,
    loginGoogleAuto,
    logoutFull,
    handleGoogleRedirectResult
} from "../lib/authActions";
import { User, TEAMS, TeamProfile } from "../types/auth";
import { PlayerProfile, TeamId } from "../types/store";

type AuthCtx = {
    // Auth State
    user: User | null;
    firebaseUser: FirebaseUser | null;

    // Explicit Loading States
    authLoading: boolean;  // Firebase Auth Check
    roleLoading: boolean;  // Firestore User Doc Fetch
    loading: boolean;      // Combined (authLoading || roleLoading)

    // Core Actions
    loginEmail: (email: string, password: string) => Promise<void>;
    signupEmail: (email: string, password: string) => Promise<void>;
    loginGoogle: () => Promise<void>;
    loginWithGoogle: () => Promise<void>; // Alias
    logout: () => Promise<void>;

    // Data State
    activePlayer: PlayerProfile | null;
    activeTeam: TeamProfile | null;
    selectedTeam: TeamProfile | null; // Added alias for compatibility

    // Logic
    isAdmin: boolean;
    selectTeam: (teamId: string, pin: string) => Promise<boolean>;
    hasAccess: (feature: string) => boolean;

    // Legacy / Aliases
    login: (email: string, password: string) => Promise<boolean>;
    TEAMS: TeamProfile[];
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
    const [activeTeam, setActiveTeam] = useState<TeamProfile | null>(null);

    // Split Loading States
    const [authLoading, setAuthLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true);

    // 1. GLOBAL AUTH LISTENER (THE ONLY ONE)
    useEffect(() => {
        // Handle Redirect Result FIRST (for PWA)
        getRedirectResult(auth).catch(e => console.error("Redirect Result Error:", e));

        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            console.log("🔐 [AUTH STATE CHANGED]:", fUser?.email || "No User");

            // Phase 1: Auth Identity Determined
            setAuthLoading(true);
            setRoleLoading(true); // Assume fetching profile if user exists

            if (!fUser) {
                setFirebaseUser(null);
                setUser(null);
                setActiveTeam(null);
                setAuthLoading(false);
                setRoleLoading(false); // No profile to fetch
                return;
            }

            setFirebaseUser(fUser);
            setAuthLoading(false); // Auth identity known, now fetching profile

            // Phase 2: Fetch or Create User Doc
            try {
                const ref = doc(db, "users", fUser.uid);
                const snap = await getDoc(ref);

                let userData;

                if (!snap.exists()) {
                    console.log("🆕 Creating New User Profile:", fUser.email);
                    userData = {
                        uid: fUser.uid,
                        email: fUser.email || "",
                        displayName: fUser.displayName || "",
                        role: "USER",
                        status: "active",
                        teamId: null, // Force them to pick a team
                        provider: fUser.providerData[0]?.providerId || 'unknown',
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        photoURL: fUser.photoURL || ""
                    };
                    await setDoc(ref, userData);
                } else {
                    console.log("✅ Existing User Found:", snap.data().email);
                    await updateDoc(ref, { lastLogin: serverTimestamp() });
                    userData = snap.data();
                }

                // Construct Safe App User Object
                const appUser: User = {
                    id: fUser.uid,
                    name: userData.name || userData.displayName || fUser.displayName || "User",
                    email: fUser.email || "",
                    role: (userData.role === 'admin' || userData.role === 'ADMIN') ? 'ADMIN' : 'USER',
                    avatar: userData.photoURL || fUser.photoURL || "",
                    isDisabled: userData.status === 'suspended' || userData.isDisabled,
                    teamId: userData.teamId,
                    isOnboarded: !!userData.teamId // Simple onboarding check
                };

                setUser(appUser);

                // Set Active Team
                if (appUser.teamId) {
                    const t = TEAMS.find(team => team.id === appUser.teamId);
                    if (t) setActiveTeam(t);
                }

            } catch (error) {
                console.error("❌ CRITICAL AUTH ERROR:", error);
                // User is authenticated but profile missing/error.
                // We should ideally show an error page, but for now we fallback to keeping them logged in without profile data (User will match, role will be USER)
                // Or force logout?
                // Let's keep minimal user state so they aren't booted instantly
                setUser({
                    id: fUser.uid,
                    name: fUser.displayName || "User",
                    role: 'USER',
                    teamId: undefined
                } as any);
            } finally {
                console.log("🔓 Role Loading Complete");
                setRoleLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Derived State
    const isAdmin = user?.role === 'ADMIN' || user?.teamId === 'uncle_joy';
    const loading = authLoading || roleLoading;

    // Helpers
    const selectTeam = async (teamId: string, pin: string): Promise<boolean> => {
        if (!firebaseUser) return false;
        if (TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) return false; // Basic PIN check

        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), { teamId: teamId });
            const t = TEAMS.find(x => x.id === teamId);
            if (t) {
                setActiveTeam(t);
                setUser(prev => prev ? { ...prev, teamId: teamId as TeamId } : null);
            }
            return true;
        } catch (e) {
            console.error("Team Select Error", e);
            return false;
        }
    };

    const value = useMemo<AuthCtx>(() => ({
        user,
        firebaseUser,
        authLoading,
        roleLoading,
        loading,

        activePlayer: user as any, // Legacy compat
        activeTeam,
        selectedTeam: activeTeam, // Alias
        isAdmin,
        selectTeam,
        hasAccess: () => true, // Simplified

        loginEmail: async (e, p) => { await loginEmail(e, p); },
        signupEmail: async (e, p) => { await signupEmail(e, p); },
        loginGoogle: async () => { await loginGoogleAuto(); },
        loginWithGoogle: async () => { await loginGoogleAuto(); },
        login: async (e, p) => { try { await loginEmail(e, p); return true; } catch { return false; } },
        logout: async () => {
            await logoutFull();
            // State will be cleared by listener
        },
        TEAMS
    }), [user, firebaseUser, loading, activeTeam, isAdmin, authLoading, roleLoading]);

    // Initial Splash Screen
    // Only block if AUTH is unknown. If Auth is known but Role is loading, we might show a spinner inside the layout?
    // Requirement: "roleLoading ends as soon as Firestore user doc is ready".
    // "No return null".
    // Let's allow the Provider to render children even if loading, so Guards can handle specific redirects.
    // BUT, for the *very first* load (authLoading), we should probably block to prevent a flash of Login Page if user is actually logged in.
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#070A0F] text-accent-gold">
                <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mb-4" />
                <div className="text-xl font-bold tracking-widest animate-pulse">SOBEK PLAY</div>
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
