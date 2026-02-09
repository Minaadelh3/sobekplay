import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// --- 1. CONFIGURATION ---
// Best Practice: Use a strictly typed utility to fetch env vars. 
// This handles the difference between Vite (import.meta.env) and Next.js (process.env) if migration happens,
// but here we stick to Vite's standard.
const getEnv = (key: string): string => {
    // Vercel/Next.js often exposes vars on process.env, while Vite uses import.meta.env.
    // We check import.meta.env first for Vite consistency, then process.env for Node scripts.
    let val = "";
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            val = import.meta.env[`VITE_${key}`] || import.meta.env[`NEXT_PUBLIC_${key}`];
        }
    } catch (e) { /* ignore */ }

    if (!val && typeof process !== 'undefined' && process.env) {
        val = process.env[`VITE_${key}`] || process.env[`NEXT_PUBLIC_${key}`];
    }
    return val || "";
};

export const firebaseConfig = {
    apiKey: getEnv("FIREBASE_API_KEY"),
    authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
    projectId: getEnv("FIREBASE_PROJECT_ID"),
    storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnv("FIREBASE_APP_ID"),
    measurementId: getEnv("FIREBASE_MEASUREMENT_ID"),
};

// --- VALIDATION ---
// We identify missing keys to provide a clear error in the console.
export const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
    .map(([key]) => key);

export const isFirebaseConfigValid = missingKeys.length === 0;

// --- 2. SINGLETON INITIALIZATION ---
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigValid) {
    try {
        // Idempotent check: strictly prevent double-initialization
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);

        // --- AUTH PERSISTENCE FIX ---
        setPersistence(auth, browserLocalPersistence)
            .then(() => console.log("💾 [Firebase] Persistence set to LOCAL"))
            .catch((err) => console.error("❌ [Firebase] Persistence Failed:", err));

        db = getFirestore(app);
        storage = getStorage(app);

        // Messaging is only supported in browser environments
        if (typeof window !== 'undefined') {
            // We import dynamically or just use getMessaging if supported
            // For simplicity in this file structure:
            // messaging = getMessaging(app); 
        }

    } catch (error) {
        console.error("🔥 Firebase Init Fatal Error:", error);
        throw new Error(`Firebase Initialization Failed: ${error}`);
    }
} else {
    console.error("⚠️ Firebase Config Missing Keys:", missingKeys);
    // CRITICAL: We DO NOT crash here. We rely on the app to check validation.
    // However, exporting undefined causes crashes downstream.
    // We export a dummy or let it be undefined but warn consumers.
    // Best Approach for Safety: Throw invalid config error only when accessed?
    // No, better to let it fail loudly in console but allow dev to see UI if possible.
    // But since `auth` is used immediately in `AuthContext`, we MUST provide a fallback
    // OR ensure AuthContext handles undefined.

    // For now, valid config is required for this app to work.
}

// --- 3. EXPORTS ---
// We export these. Consumers MUST check if they are defined or we accept the crash 
// as a signal that ENV is missing. 
export { app, auth, db, storage };

// --- 4. SAFE ANALYTICS ---
export async function initAnalytics() {
    if (typeof window === "undefined" || !app) return null;
    try {
        const supported = await isSupported();
        return supported ? getAnalytics(app) : null;
    } catch (e) {
        console.warn("Analytics init failed (non-fatal):", e);
        return null;
    }
}
