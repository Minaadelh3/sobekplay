import {
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type AuthError,
    type UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * ============================================================================
 * 🔐 AUTH SERVICE — CENTRALIZED AUTHENTICATION MANAGER
 * ============================================================================
 * 
 * Replaces legacy authActions.ts.
 * Implements Singleton pattern for Auth Management.
 * Follows PWA / Offline-First / Redirect-Only strict strategy.
 */

class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Enforces Local Persistence before any Auth Action.
     * Critical for PWA session survival on iOS.
     */
    private async ensureAuthPersistence(): Promise<void> {
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

    /**
     * Login with Email & Password
     */
    public async loginEmail(email: string, password: string): Promise<UserCredential> {
        await this.ensureAuthPersistence();
        return signInWithEmailAndPassword(auth, email, password);
    }

    /**
     * Signup with Email & Password
     */
    public async signupEmail(email: string, password: string): Promise<UserCredential> {
        await this.ensureAuthPersistence();
        return createUserWithEmailAndPassword(auth, email, password);
    }

    /**
     * Global Logout
     * Clears Firebase Session + Local Storage
     */
    public async logout(): Promise<void> {
        if (!auth) return;
        console.log("🔒 [AUTH] Signing out...");
        try {
            await signOut(auth);
            localStorage.clear(); // Clear local app state
        } catch (e) {
            console.error("Logout Warning:", e);
        }
    }

    // --- Helpers ---

    public isPWA(): boolean {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
    }

    public isIOS(): boolean {
        if (typeof window === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    public isIOSStandalone(): boolean {
        return this.isIOS() && this.isPWA();
    }

    /**
     * Maps Firebase Auth Errors to User-Friendly Messages
     */
    public mapAuthError(e: unknown): string {
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
            default:
                return err?.message || "Authentication failed.";
        }
    }
}

export const authService = AuthService.getInstance();
