import React, { useEffect } from 'react';
import { useOneSignal } from '../hooks/useOneSignal';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Headless component to manage OneSignal Lifecycle
 * Must be placed inside AuthProvider
 */
export default function OneSignalManager() {
    const { subscriptionId, isOptedIn, isInitialized, permission } = useOneSignal();
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !isInitialized || !subscriptionId) return;

        const syncSubscription = async () => {
            try {
                // Determine actual push status
                // If permission is granted AND OneSignal says optedIn, then we are good.
                const isPushEnabled = isOptedIn && permission === 'granted';

                console.log(`🔔 [OneSignalManager] Syncing User: ${user.id} -> ${subscriptionId} (Enabled: ${isPushEnabled})`);

                // We use setDoc with merge: true to ensure we don't overwrite other fields but create if missing (though user doc should exist)
                // Using updateDoc is safer if we want to fail if user doesn't exist, but here we assume user exists.
                await setDoc(doc(db, "users", user.id), {
                    oneSignalId: subscriptionId,
                    pushEnabled: isPushEnabled,
                    pushPermission: permission,
                    lastSeenAt: serverTimestamp(),
                    device: {
                        params: {
                            userAgent: navigator.userAgent,
                            platform: navigator.platform
                        }
                    }
                }, { merge: true });

            } catch (e) {
                console.warn("[OneSignalManager] Sync Failed", e);
            }
        };

        syncSubscription();

    }, [user, subscriptionId, isOptedIn, permission, isInitialized]);

    return null;
}
