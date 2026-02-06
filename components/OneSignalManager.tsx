import React, { useEffect } from 'react';
import { useOneSignal } from '../hooks/useOneSignal';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import OneSignal from 'react-onesignal';

/**
 * Headless component to manage OneSignal Lifecycle
 * Must be placed inside AuthProvider
 */
export default function OneSignalManager() {
    useOneSignal();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const syncSubscription = async () => {
            try {
                // Wait for OneSignal to be ready
                await new Promise(resolve => setTimeout(resolve, 3000));

                const id = OneSignal.User.PushSubscription.id;
                const optIn = OneSignal.User.PushSubscription.optedIn;
                // Native check as OneSignal wrapper can be tricky async
                const isPushEnabled = optIn && Notification.permission === 'granted';

                if (id) {
                    console.log(`🔔 [OneSignal] Syncing User: ${user.id} -> ${id}`);
                    await updateDoc(doc(db, "users", user.id), {
                        oneSignalId: id,
                        pushEnabled: isPushEnabled,
                        lastSeenAt: serverTimestamp()
                    });
                }
            } catch (e) {
                console.warn("[OneSignal] Sync Failed", e);
            }
        };

        // Sync on mount and periodically check
        syncSubscription();

        // Optional: Listen for subscription changes if OneSignal SDK supports it event-based, 
        // but for now simple sync on load is sufficient for MVP.

    }, [user?.id]);

    return null;
}
