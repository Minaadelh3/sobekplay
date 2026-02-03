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
    // We check import.meta.env first for Vite consistency.
    const val = import.meta.env[`VITE_${key}`] || import.meta.env[`NEXT_PUBLIC_${key}`];
    return val || "";
};

const firebaseConfig = {
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
        // This is crucial in strict mode / hot-reload environments
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        
        // --- AUTH PERSISTENCE FIX ---
        // Force Browser Local Persistence (works best for PWA)
        // We fire this immediately. Auth actions will also ensure it.
        setPersistence(auth, browserLocalPersistence)
            .then(() => console.log("💾 [Firebase] Persistence set to LOCAL"))
            .catch((err) => console.error("❌ [Firebase] Persistence Failed:", err));

        db = getFirestore(app);
        storage = getStorage(app);

    } catch (error) {
        console.error("🔥 Firebase Init Fatal Error:", error);
        // We do typically want to throw here to stop the app from running in a broken state
        // creating confusion with "undefined" errors later.
        throw new Error(`Firebase Initialization Failed: ${error}`);
    }
} else {
    // In production, this should likely throw. 
    // In dev, it might be recoverable if just testing UI.
    console.error("⚠️ Firebase Config Missing Keys:", missingKeys);
    console.error("Please add these to your .env file or Vercel Project Settings.");
}

// --- 3. EXPORTS ---
// We export these. If init failed, they will be undefined, 
// so consumers (like AuthContext) MUST handle strict checks or try-catch.
// However, typically the app should crash early if backend is required.
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
