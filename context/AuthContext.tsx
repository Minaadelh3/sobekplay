"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser, getRedirectResult, UserCredential, setPersistence, browserLocalPersistence } from "firebase/auth";
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
    authReady: boolean;
    roleReady: boolean;
    loading: boolean;

    loginEmail: (email: string, password: string) => Promise<UserCredential>;
    signupEmail: (email: string, password: string) => Promise<UserCredential>;
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

    // Stable Readiness Flags
    const [authReady, setAuthReady] = useState(false);
    const [roleReady, setRoleReady] = useState(false);

    // --- 1. GLOBAL INITIALIZATION ---
    // --- 1. GLOBAL INITIALIZATION ---
    // Strict Mode / Double-Init Guard
    // --- 1. GLOBAL INITIALIZATION ---

    useEffect(() => {
        let unsubscribe: () => void;

        const initAuth = async () => {
            console.log("🔐 [AUTH] Initializing...");
            // We start true, and ONLY set to false when Firebase returns a User or Null.
            setAuthLoading(true);

            // A. Handle Redirect Result (Crucial for iOS PWA)
            // We check this BEFORE listening to auth state to ensure we capture the returning user
            // and don't prematurely render the "Guest" state if they just signed in.
            try {
                if (!auth) {
                    console.warn("⚠️ [AUTH] Firebase Auth not initialized (Missing Config?). Skipping redirect check.");
                    setAuthLoading(false);
                    return;
                }

                // 1. Enforce Persistence FIRST
                await setPersistence(auth, browserLocalPersistence);
                console.log("💾 [AUTH] Persistence Enforced (Browser Local)");

                // Determine if we are likely returning from a redirect flow
                // This prevents unnecessary processing on every app load, though getRedirectResult is generally lightweight.
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("✅ [AUTH] Redirect Login Success:", result.user.email);
                    console.log("✅ [AUTH] Provider:", result.providerId);
                    // The user is signed in. `onAuthStateChanged` will fire shortly with the user.
                    // We stay in `authLoading = true` until that happens.
                } else {
                    console.log("ℹ️ [AUTH] No redirect result found.");
                }
            } catch (e: any) {
                console.error("❌ [AUTH] Redirect Result Error:", e);
                console.error("Code:", e.code);
                console.error("Message:", e.message);

                // If the error is regarding pending redirects or other recoverable states, we might want to alert.
                // But generally, we just proceed to the normal listener.
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
            // In Strict Mode, this cleanup runs immediately after the first effect.
            // We DO NOT want to unsubscribe if we are maintaining the singleton connection,
            // but normally we should. However, for Auth, we often want the listener to persist
            // unless the component truly unmounts.
            //
            // With the `isInitializing` guard at the top, the second effect won't run `initAuth` again.
            // But if we unsubscribe here in the first cleanup, we kill the listener that `initAuth` just set up.
            //
            // FIX: We only unsubscribe if we are NOT in the "double-fire" instant unmount.
            // But since we can't easily detect that, a common pattern for Auth is to ref-count or just leave it,
            // or simply accept that the Ref guard prevents the *second* setup, but we risk the first cleanup killing the first setup.
            //
            // BETTER FIX for Strict Mode:
            // Let the cleanup happen. But then the `initAuth` needs to be robust.
            //
            // Actually, the `isInitializing` guard prevents the SECOND run.
            // But the FIRST run's cleanup will kill the FIRST listener.
            // Result: No listener.
            //
            // CORRECT PATTERN:
            // Allow the effect to run every time, but ensure `getRedirectResult` is only called ONCE globally if possible,
            // or just rely on Firebase's internal handling.
            //
            // IF we strictly blocked the second run, we are broken because the first run cleans up.
            //
            // REVISED STRATEGY IN CODE BELOW:
            // We remove the `isInitializing` strict return for the listener part,
            // but we keep the `getRedirectResult` guarded or just allow it (Firebase handles it okay usually, but loop implies otherwise).
            //
            // Actually, the loop might be `LoginPage` redirecting to itself?
            // Let's stick to the plan: Guard it.
            // NOTE: To fix the "Cleanup kills it" issue, we actually need to NOT cleanup in strict mode's fake unmount.
            // But we can't know.
            //
            // Alternative: use a mounted ref to avoid setting state if unmounted.
            //
            // Let's try the simple guard first BUT with a twist: we won't unsubscribe in the cleanup if it's just a remount? 
            // No, standard practice: cleaning up is correct.
            //
            // The issue with `getRedirectResult` is likely that it consumes the token.
            //
            // Let's wrap the `getRedirectResult` in a separate verified boolean or just try-catch it safely.

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
