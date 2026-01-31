import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// --- 1. CONFIGURATION ---
const getEnv = (key: string) => {
    return import.meta.env[`NEXT_PUBLIC_${key}`] || import.meta.env[`VITE_${key}`];
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

// --- VALIDATION STATE ---
export const missingKeys = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value && key !== 'measurementId')
    .map(([key]) => key);

export const isFirebaseConfigValid = missingKeys.length === 0;

// --- 2. SINGLETON INITIALIZATION ---
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigValid) {
    try {
        app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
    }
} else {
    console.error("Firebase Config Missing Keys:", missingKeys);
}

// Re-export instances as definitely assigned to avoid breaking TS everywhere, 
// but Consumer must check `isFirebaseConfigValid` or rely on EnvValidator to block access if invalid.
// We cast them to avoid 'undefined' checks in every single file, assuming EnvValidator catches the issue first.
export { app, auth, db };

// --- 3. SAFE ANALYTICS ---
export async function initAnalytics() {
    if (typeof window === "undefined" || !app) return null;
    const supported = await isSupported();
    return supported ? getAnalytics(app) : null;
}
