"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getRedirectResult, UserCredential, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
    loginEmail,
    signupEmail,
    loginGoogleAuto,
    loginAppleAuto,
    logoutFull
} from "../lib/authActions";
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
    loginGoogle: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithApple: () => Promise<void>;
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
        let unsubscribe: () => void;

        const initAuth = async () => {
            log("🔐 [AUTH] Initializing AuthProvider v2.1...");
            // We start true, and ONLY set to false when Firebase returns a User or Null.
            setAuthLoading(true);

            if (!auth) {
                log("⚠️ [AUTH] Firebase Auth not initialized (Missing Config?). Skipping.");
                setAuthLoading(false);
                return;
            }

            try {
                // 1. Enforce Persistence FIRST
                await setPersistence(auth, browserLocalPersistence);
                log("💾 [AUTH] Persistence Enforced (Browser Local)");

                // 2. Handle Redirect Result (Crucial for iOS PWA)
                // REMOVED STRICT MODE GUARD: Better to check twice than zero times.
                log("🔄 [AUTH] Checking Redirect Result...");
                const result = await getRedirectResult(auth);

                if (result) {
                    log(`✅ [AUTH] Redirect Login Success: ${result.user.email}`);
                    // OPTIMISTIC UPDATE: Set user immediately to prevent "Guest" flash
                    setFirebaseUser(result.user);
                    // The onAuthStateChanged will fire anyway
                } else {
                    log("ℹ️ [AUTH] No redirect result found (Normal load or Popup).");
                }
            } catch (e: any) {
                log(`❌ [AUTH] Redirect Result Error: ${e.code} - ${e.message}`);
            }

            // B. Listen for Auth Changes
            unsubscribe = onAuthStateChanged(auth, async (fUser) => {
                console.log("👤 [AUTH] Change Detected:", fUser?.email || "Guest");

                if (!fUser) {
                    // LOGGED OUT
                    setFirebaseUser(null);
                    setUser(null);
                    setActiveTeam(null);
                    setRoleLoading(false);
                    // Crucial: Only now do we let the UI render for guests
                    setAuthLoading(false);

                    setAuthReady(true);
                    setRoleReady(true);
                    return;
                }

                // LOGGED IN
                setFirebaseUser(fUser);
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
                        const staticTeam = TEAMS.find(team => team.id === appUser.teamId);
                        if (staticTeam) {
                            setActiveTeam(staticTeam);
                        } else {
                            // Fetch Dynamic Team
                            try {
                                const teamDoc = await getDoc(doc(db, "teams", appUser.teamId));
                                if (teamDoc.exists()) {
                                    setActiveTeam({ id: appUser.teamId, ...teamDoc.data() } as TeamProfile);
                                } else {
                                    // Fallback placeholder to prevent loop
                                    setActiveTeam({
                                        id: appUser.teamId as any,
                                        name: appUser.teamId,
                                        avatar: '/assets/brand/logo.png',
                                        color: 'from-gray-700 to-black',
                                        points: 0,
                                        isScorable: true
                                    });
                                }
                            } catch (err) {
                                console.error("Error fetching dynamic team", err);
                                // Fallback
                                setActiveTeam({
                                    id: appUser.teamId as any,
                                    name: appUser.teamId,
                                    avatar: '/assets/brand/logo.png',
                                    color: 'from-gray-700 to-black',
                                    points: 0,
                                    isScorable: true
                                });
                            }
                        }
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
                    setRoleReady(true);
                    setAuthLoading(false); // Auth is now fully ready (User + Profile + Team)
                    setAuthReady(true);
                }
            });
        };

        // Fire initialization
        initAuth();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const isAdmin = user?.role === 'ADMIN' || user?.teamId === 'uncle_joy';
    const loading = authLoading || roleLoading;

    // Actions
    const handleLoginGoogle = async () => {
        // Enforce Strict Redirect (PWA Safe)
        await loginGoogleAuto();
        // Page will redirect. No further code execution expected here.
    };

    const selectTeam = async (teamId: string, pin: string): Promise<boolean> => {
        if (!firebaseUser) return false;
        if (TEAM_PINS[teamId] && TEAM_PINS[teamId] !== pin) return false;

        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), { teamId });
            setUser(prev => prev ? { ...prev, teamId: teamId as TeamId } : null);

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
        loginEmail,
        signupEmail,
        loginGoogle: handleLoginGoogle,
        loginWithGoogle: handleLoginGoogle,
        loginWithApple: async () => { await loginAppleAuto(); },
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
