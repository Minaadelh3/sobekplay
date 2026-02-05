import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-hot-toast';

// We use the 'messaging' instance from firebase.ts usually, but here we init safely
// to avoid crashes in environments without window/sw support
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export function usePushNotifications() {
    const { user, firebaseUser } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Check permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Listen for foreground messages
    useEffect(() => {
        if (!messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground Message:", payload);
            // Show toast
            if (payload.notification) {
                // You can use a toast library here
                const { title, body } = payload.notification;
                // Custom Toast Implementation or plain alert for now if no lib
                // console.log(`New Message: ${title} - ${body}`);
                // We can trigger a local state or event
            }
        });

        return () => unsubscribe();
    }, []);

    // Register Token Logic
    const registerToken = useCallback(async () => {
        if (!messaging || !firebaseUser) return;
        setLoading(true);
        try {
            if (Notification.permission !== 'granted') {
                const p = await Notification.requestPermission();
                setPermission(p);
                if (p !== 'granted') {
                    throw new Error("Permission denied");
                }
            }

            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            if (currentToken) {
                setFcmToken(currentToken);
                await saveTokenToFirestore(firebaseUser.uid, currentToken);
                console.log("FCM Token Registered:", currentToken);
            } else {
                console.warn("No registration token available.");
            }
        } catch (error) {
            console.error("An error occurred while retrieving token.", error);
        } finally {
            setLoading(false);
        }
    }, [firebaseUser]);

    const saveTokenToFirestore = async (uid: string, token: string) => {
        // Store in subcollection for device management
        const deviceRef = doc(db, 'users', uid, 'devices', token);
        await setDoc(deviceRef, {
            token,
            userAgent: navigator.userAgent,
            lastActive: serverTimestamp(),
            platform: 'web'
        }, { merge: true });

        // Also ensure 'pushSettings' exists via update (optional, backend handles it usually)
    };

    const unregisterToken = useCallback(async () => {
        if (!messaging || !firebaseUser || !fcmToken) return;
        setLoading(true);
        try {
            await deleteToken(messaging);
            // Remove from Firestore
            await deleteDoc(doc(db, 'users', firebaseUser.uid, 'devices', fcmToken));
            setFcmToken(null);
            console.log("Token deleted.");
        } catch (error) {
            console.error("Error deleting token", error);
        } finally {
            setLoading(false);
        }
    }, [firebaseUser, fcmToken]);

    return {
        permission,
        fcmToken,
        registerToken,
        unregisterToken,
        loading,
        isSupported: !!messaging
    };
}
