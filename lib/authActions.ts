/**
 * ============================================================================
 * 🔐 AUTH MODULE — STRICT PWA / OFFLINE-FIRST / REDIRECT-ONLY STRATEGY
 * ============================================================================
 *
 * ⚠️ READ THIS BEFORE MODIFYING ANYTHING
 *
 * This file implements a **Principal Engineer–approved authentication strategy**
 * designed specifically for:
 *
 * - Progressive Web Apps (PWA)
 * - iOS & Android Standalone Mode
 * - Mobile WebViews
 * - Offline-first resilience
 * - Firebase Auth v9+ (Modular SDK)
 *
 * ---------------------------------------------------------------------------
 * 🧠 CORE DESIGN PRINCIPLES
 * ---------------------------------------------------------------------------
 *
 * 1️⃣ REDIRECT-ONLY AUTH (NON-NEGOTIABLE)
 * ------------------------------------
 * - This module MUST use `signInWithRedirect`.
 * - `signInWithPopup` is FORBIDDEN.
 *
 * WHY:
 * - iOS PWA WebViews block popups by design.
 * - Mobile WebViews often fail to close popups.
 * - Popup-based auth causes:
 *   - auth/operation-not-supported-in-this-environment
 *   - Infinite login loops
 *   - Broken sessions after app restart
 *
 * If you reintroduce popups, YOU WILL break PWA auth.
 *
 * ---------------------------------------------------------------------------
 * 2️⃣ PERSISTENCE IS NOT OPTIONAL
 * -------------------------------
 * - `setPersistence(auth, browserLocalPersistence)` MUST be called
 *   BEFORE every authentication action.
 *
 * WHY:
 * - PWAs rely on IndexedDB / local storage for session survival.
 * - Without explicit persistence:
 *   - Sessions are lost on app restart
 *   - Offline users are logged out incorrectly
 *
 * Persistence failures MUST be logged and handled explicitly.
 *
 * ---------------------------------------------------------------------------
 * 3️⃣ REDIRECT RESULT HANDLING LOCATION
 * ------------------------------------
 * - `getRedirectResult(auth)` MUST be handled:
 *   - Inside AuthContext / useAuth
 *   - On application boot
 *
 * - DO NOT:
 *   ❌ Handle redirect results here
 *   ❌ Expose redirect handlers as helpers
 *   ❌ Create empty or stub redirect functions
 *
 * WHY:
 * - Redirect-based auth reloads the app.
 * - The auth state is only recoverable during initialization.
 * - Handling redirect results anywhere else causes login loops.
 *
 * ---------------------------------------------------------------------------
 * 4️⃣ OFFLINE-FIRST BEHAVIOR
 * -------------------------
 * - If the user is OFFLINE:
 *   - Do NOT attempt redirect-based login.
 *   - Surface a clear error instead.
 *
 * - Firebase will restore cached auth state automatically when offline.
 * - The user MUST remain logged in while offline if a valid session exists.
 *
 * ---------------------------------------------------------------------------
 * 5️⃣ AUTH STATE SOURCE OF TRUTH
 * ------------------------------
 * - `onAuthStateChanged` is the ONLY source of truth.
 *
 * - DO NOT:
 *   ❌ Assume user === null before Firebase resolves
 *   ❌ Redirect while auth is loading
 *   ❌ Force navigation from inside auth actions
 *
 * Loading must resolve FIRST.
 *
 * ---------------------------------------------------------------------------
 * 6️⃣ ENVIRONMENT SAFETY
 * ---------------------
 * - Auth actions MUST run only in the browser.
 * - Calling login actions on the server MUST throw explicitly.
 *
 * WHY:
 * - Next.js App Router & SSR environments execute server-side code.
 * - OAuth redirects cannot be initiated server-side.
 *
 * ---------------------------------------------------------------------------
 * 7️⃣ CODE HYGIENE RULES
 * ---------------------
 * - No unused imports
 * - No legacy popup errors
 * - No future-use stubs
 * - No silent failures
 * - Errors MUST be explicit and logged
 *
 * ---------------------------------------------------------------------------
 * 🚨 WARNING TO FUTURE DEVELOPERS / AI TOOLS
 * ---------------------------------------------------------------------------
 *
 * - DO NOT reintroduce `signInWithPopup`
 * - DO NOT add platform branching (popup vs redirect)
 * - DO NOT move persistence logic elsewhere
 * - DO NOT add redirect handlers here
 *
 * Violating any of the above WILL:
 * - Break iOS PWA auth
 * - Cause login loops
 * - Corrupt offline behavior
 *
 * If behavior needs to change, update the AUTH STRATEGY DOCUMENTATION FIRST.
 *
 * ============================================================================
 */
import {
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

// --- Configuration ---
// (Email/Pass only - Providers removed)

// --- Helpers ---
export const isPWA = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
};

export const isIOS = (): boolean => {
    if (typeof window === 'undefined') return false;
    // Robust iOS detection including iPad OS 13+
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isIOSStandalone = (): boolean => {
    return isIOS() && isPWA();
};

// --- Core Actions ---

/**
 * Enforces Local Persistence before any Auth Action.
 * Critical for PWA session survival on iOS.
 */
export async function ensureAuthPersistence() {
    if (!auth) {
        console.error("❌ [AUTH] Persistence Failed: Auth not initialized.");
        throw new Error("Firebase Auth not initialized");
    }
    try {
        await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
        console.error("❌ [AUTH] Persistence Error:", e);
        throw e;
    }
}

export async function signupEmail(email: string, password: string) {
    await ensureAuthPersistence();
    return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginEmail(email: string, password: string) {
    await ensureAuthPersistence();
    return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutFull() {
    if (!auth) return;
    console.log("🔒 [AUTH] Signing out...");
    try {
        await signOut(auth);
        localStorage.clear(); // Clear local app state
    } catch (e) {
        console.error("Logout Warning:", e);
    }
}

// --- Error Mapping ---

export function mapAuthError(e: unknown): string {
    const err = e as AuthError;
    const code = err?.code ?? "";

    switch (code) {
        case "auth/network-request-failed":
            return "Check your internet connection.";
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Invalid email or password.";
        case "auth/email-already-in-use":
            return "Email already registered.";
        case "auth/weak-password":
            return "Password too weak.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/operation-not-allowed":
            return "Login method not enabled.";
        case "auth/redirect-cancelled-by-user":
            return "Login cancelled.";
        // Removed Popup-specific errors as we no longer use Popups.
        default:
            return err?.message || "Authentication failed.";
    }
}
