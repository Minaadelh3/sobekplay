import * as admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : undefined;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("🔥 [Firebase Admin] Initialized with Service Account");
        } else {
            // Fallback for local development or if Google Application Credentials are set automatically
            console.warn("⚠️ [Firebase Admin] No FIREBASE_SERVICE_ACCOUNT found. Trying default credentials...");
            admin.initializeApp();
        }
    } catch (error) {
        console.error("❌ [Firebase Admin] Initialization Error:", error);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();
