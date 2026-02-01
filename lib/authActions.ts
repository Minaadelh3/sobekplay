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

// --- Helpers ---
export const isPWA = (): boolean => {
    if (typeof window === 'undefined') return false;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

    return isStandalone;
};

export const isIOS = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// --- Core Actions ---

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
 * Intelligent Google Login for PWA / Mobile
 */
export async function loginGoogleAuto() {
    await ensureAuthPersistence();

    const isPwaMode = isPWA();
    const isIosDevice = isIOS();

    // PWA Strategy: 
    // - Android/Desktop PWA: Use REDIRECT (better UX, no popup blocking)
    // - iOS PWA: Use POPUP (Redirect often fails to return to app context or causes loops)
    // - Regular Browser: Use POPUP

    // We only use Redirect if it's a PWA AND NOT iOS.
    const shouldUseRedirect = isPwaMode && !isIosDevice;

    console.log(`[SOBEK-AUTH] Google Login - PWA: ${isPwaMode}, iOS: ${isIosDevice} -> Mode: ${shouldUseRedirect ? 'REDIRECT' : 'POPUP'}`);

    try {
        if (shouldUseRedirect) {
            // REDIRECT FLOW (Android/Desktop PWA)
            await signInWithRedirect(auth, googleProvider);
            // The page will reload. The result is handled in AuthContext -> handleGoogleRedirectResult
            return;
        } else {
            // POPUP FLOW (iOS PWA or Regular Browser)
            return await signInWithPopup(auth, googleProvider);
        }
    } catch (error: any) {
        console.error("Google Login Failed:", error);

        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            alert("Please allow popups to sign in, or try the app installed on your home screen.");
        } else {
            alert(`Login Failed: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Must be called on App Mount (AuthContext) to capture the returning user from Redirect
 */
export async function handleGoogleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log("✅ [SOBEK-AUTH] Redirect Login Success:", result.user.email);
            return result.user;
        }
        return null;
    } catch (error) {
        console.error("❌ [SOBEK-AUTH] Redirect Error:", error);
        // Do not throw here, just log, so app can continue
        return null;
    }
}

export async function logoutFull() {
    console.log("🔒 Signing out...");
    await signOut(auth);
    localStorage.clear();
    // Optional: reload to clear memory state completely
    // window.location.reload(); 
}

// --- Error Mapping ---

export function mapAuthError(e: unknown): string {
    const err = e as AuthError;
    const code = err?.code ?? "";

    switch (code) {
        case "auth/popup-blocked":
            return "Popup blocked. Please allow popups.";
        case "auth/popup-closed-by-user":
            return "Login cancelled.";
        case "auth/unauthorized-domain":
            return "Unauthorized domain (Firebase Console).";
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
        default:
            return err?.message || "Authentication failed.";
    }
}
