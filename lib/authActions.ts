import {
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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
 * Ensures session persists across browser restarts.
 * Called automatically before every login action.
 */
export async function ensureAuthPersistence() {
    await setPersistence(auth, browserLocalPersistence);
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
 * Intelligent Google Login:
 * - Desktop: Popup (Better UX)
 * - Mobile: Redirect (Required for reliable auth on iOS/Android WebViews)
 */
export async function loginGoogleAuto() {
    await ensureAuthPersistence();

    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // Check if running on localhost or local IP (common for dev)
    // UNIFIED STRATEGY: Always use Popup
    // Why? 'signInWithRedirect' fails on Vercel deployments (Mobile) due to Third-Party Cookie blocking (ITP).
    // The Redirect flow requires the auth domain and app domain to share cookies, which they don't (firebaseapp.com vs vercel.app).
    // Since we fixed Cross-Origin-Opener-Policy (COOP) in vite.config.ts, Popup is now viable on Mobile.

    console.log(`[SOBEK-AUTH] Starting Google Login (Popup Mode) - Mobile: ${isMobile}`);

    try {
        return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
        console.error("Popup Login Failed:", error);

        // Specific handling for Mobile Popup Blocks
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            alert("Please allow popups for this site to sign in with Google.");
        } else {
            alert(`Login Failed: ${error.message}`);
        }
        throw error;
    }
}
/* REMOVED REDIRECT LOGIC TO PREVENT LOOP */

/**
 * Must be called on App Mount to handle returning from a redirect flow (Mobile).
 */
export async function handleGoogleRedirectResult() {
    console.log("[SOBEK-AUTH] Checking for redirect result...");
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log("✅ [SOBEK-AUTH] Google Redirect Login Successful", result.user.email);
        } else {
            console.log("[SOBEK-AUTH] No redirect result found.");
        }
        return result;
    } catch (error) {
        console.error("❌ [SOBEK-AUTH] Google Redirect Error:", error);
        throw error;
    }
}

export async function logoutFull() {
    console.log("🔒 Signing out...");
    await signOut(auth);
    // Optional: Clear any app-specific local storage if strictly required
    // localStorage.removeItem('sobek_gamification'); 
    // window.location.reload(); // Aggressive but ensures clean slate
}

// --- Helpers ---

export function mapAuthError(e: unknown): string {
    const err = e as AuthError;
    const code = err?.code ?? "";

    switch (code) {
        case "auth/popup-blocked":
            return "Popup blocked. Please allow popups or use mobile.";
        case "auth/popup-closed-by-user":
            return "Login cancelled.";
        case "auth/unauthorized-domain":
            return "Unauthorized domain. Check Firebase Console settings.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Invalid email or password.";
        case "auth/email-already-in-use":
            return "Email already registered. Please login.";
        case "auth/weak-password":
            return "Password is too weak (min 6 chars).";
        case "auth/too-many-requests":
            return "Too many requests. Try again later.";
        default:
            return err?.message || "Authentication failed.";
    }
}
