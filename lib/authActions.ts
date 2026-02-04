import {
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
    signInWithRedirect,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

// --- Configuration ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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

/**
 * Strict Google Login Strategy (Redirect ONLY)
 * 
 * We deliberately avoid signInWithPopup to guarantee stability on:
 * - iOS PWA (Standalone) -> Popups are blocked/broken.
 * - Mobile WebViews -> Popups often fail to close.
 * - Strict Browser Environments.
 * 
 * Flow:
 * 1. Set Persistence.
 * 2. Redirect to Google.
 * 3. Page Reloads.
 * 4. AuthContext captures result via getRedirectResult().
 */
export async function loginGoogleAuto() { // Keep name for compatibility or rename if refactoring Context
    console.log("🔐 [AUTH] Starting Google Redirect Flow...");
    await ensureAuthPersistence();

    // Explicitly THROW if called in a non-browser env (sanity check)
    if (typeof window === 'undefined') {
        throw new Error("Cannot initiate login on server-side.");
    }

    try {
        await signInWithRedirect(auth, googleProvider);
        // Execution stops here as page unloads.
    } catch (error: any) {
        console.error("❌ [AUTH] Google Redirect Failed:", error);
        throw error;
    }
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
