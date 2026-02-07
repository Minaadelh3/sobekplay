import admin from 'firebase-admin';

// Helper to initialize on demand
const initFirebase = () => {
    // Debug logging
    console.log("🔥 [Firebase Admin] Init check. Admin type:", typeof admin);
    console.log("🔥 [Firebase Admin] Admin keys:", admin ? Object.keys(admin) : "null");
    if (admin && (admin as any).default) {
        console.log("🔥 [Firebase Admin] Possible ESM mismatch. 'admin.default' exists.");
    }

    // Safety check for admin object
    if (!admin) {
        throw new Error("Firebase Admin SDK failed to load.");
    }

    // Check for apps safely
    const apps = admin.apps;
    console.log("🔥 [Firebase Admin] Apps:", apps);

    if (apps && apps.length) return;

    try {
        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            } catch (jsonError) {
                console.error("❌ [Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT env var. It must be valid JSON.");
                throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("🔥 [Firebase Admin] Initialized with Service Account");
        } else {
            // Fallback for local development or if Google Application Credentials are set automatically
            console.warn("⚠️ [Firebase Admin] No FIREBASE_SERVICE_ACCOUNT. Trying default credentials...");
            admin.initializeApp();
        }
    } catch (error) {
        console.error("❌ [Firebase Admin] Initialization Error:", error);
        throw error; // Re-throw so the caller knows it failed
    }
};

// Lazy Getters
export const getDb = () => {
    initFirebase();
    // Handle ESM/CJS interop for namespace access
    const _admin = (admin as any).default || admin;
    return _admin.firestore();
};

export const getAuth = () => {
    initFirebase();
    const _admin = (admin as any).default || admin;
    return _admin.auth();
};

export const getMessaging = () => {
    initFirebase();
    const _admin = (admin as any).default || admin;
    return _admin.messaging();
};

// Export FieldValue safely
export const getFieldValue = () => {
    const _admin = (admin as any).default || admin;
    return _admin.firestore.FieldValue;
};

