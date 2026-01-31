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
    const isLocalhost = window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.startsWith("192.168.");

    console.log("[SOBEK-AUTH] Starting Google Login. Mobile:", isMobile, "Localhost:", isLocalhost, "UA:", ua);

    // Force Popup on Localhost (to avoid Redirect Loop) OR Desktop
    if (isLocalhost || !isMobile) {
        console.log(`[SOBEK-AUTH] ${isLocalhost ? 'Localhost' : 'Desktop'} detected: Using signInWithPopup`);
        return signInWithPopup(auth, googleProvider);
    }

    console.log('[SOBEK-AUTH] 📱 Mobile Domain detected: Using signInWithRedirect');
    return signInWithRedirect(auth, googleProvider);
}

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
