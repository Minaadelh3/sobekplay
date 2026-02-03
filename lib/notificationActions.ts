import { getToken } from "firebase/messaging";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { messaging, db, VAPID_KEY } from "./firebase";

export interface FCMTokenData {
    token: string;
    platform: 'ios' | 'android' | 'web';
    userAgent: string;
    createdAt: any;
    updatedAt: any;
}

// 1. Platform Detection
export const getPlatform = (): 'ios' | 'android' | 'web' => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "ios";
    if (ua.includes("android")) return "android";
    return "web";
};

// 2. Request Permission & Get Token
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
    if (!messaging) {
        console.warn("⚠️ Firebase Messaging not initialized.");
        return null;
    }

    try {
        console.log("🔔 Requesting Notification Permission...");
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("✅ Notification Permission Granted.");

            // Get FCM Token
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (currentToken) {
                console.log("🔑 FCM Token Generated:", currentToken);
                await saveTokenToFirestore(userId, currentToken);
                return currentToken;
            } else {
                console.warn("⚠️ No registration token available. Request permission to generate one.");
                return null;
            }
        } else {
            console.log("🚫 Notification Permission Denied.");
            return null;
        }
    } catch (error) {
        console.error("🔥 Error processing notification permission:", error);
        return null;
    }
};

// 3. Save Token to Firestore
// Structure: users/{uid}/fcmTokens/{token} - This allows multiple devices per user
const saveTokenToFirestore = async (userId: string, token: string) => {
    if (!userId || !token) return;

    const tokenRef = doc(db, "users", userId, "fcmTokens", token);
    const platform = getPlatform();

    try {
        // Check if exists to avoid unnecessary writes if nothing changed (optional optimization)
        // But for sync, we usually just overwrite timestamps
        await setDoc(tokenRef, {
            token,
            platform,
            userAgent: navigator.userAgent,
            createdAt: serverTimestamp(), // Keep original creation? better logic might be needed if we want to track freshness
            updatedAt: serverTimestamp(),
            lastSeen: serverTimestamp()
        }, { merge: true });

        console.log("💾 FCM Token saved to Firestore for user:", userId);
    } catch (error) {
        console.error("🔥 Error saving FCM token to Firestore:", error);
    }
};
