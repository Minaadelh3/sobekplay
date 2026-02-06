import { useEffect, useState, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '../context/AuthContext';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "71f9b370-fb2a-4da8-9377-d0546c5900c0";

type PermissionState = 'default' | 'granted' | 'denied';

export function useOneSignal() {
    const { firebaseUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [permission, setPermission] = useState<PermissionState>('default');
    const [isSupported, setIsSupported] = useState(true);

    // Initialize OneSignal
    useEffect(() => {
        if (!ONESIGNAL_APP_ID) {
            console.error("OneSignal App ID is missing. Check .env");
            return;
        }

        if (isInitialized) return;

        const initOneSignal = async () => {
            // 1. Abort if Offline (Prevents Network Errors)
            if (typeof window !== 'undefined' && !navigator.onLine) {
                console.log("📴 [OneSignal] Offline, skipping init.");
                return;
            }

            console.log("🔔 [OneSignal] Initializing...");

            try {
                // 2. Timeout Wrapper: If OneSignal script is blocked, don't wait forever
                const initPromise = OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerPath: 'sw.js',
                    serviceWorkerParam: { scope: '/' },
                    promptOptions: {
                        slidedown: { prompts: [] }
                    },
                });

                // Race against a 3s timeout
                await Promise.race([
                    initPromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error("OneSignal Init Timeout")), 5000))
                ]);

                setIsInitialized(true);
                setIsSupported(OneSignal.Notifications.isPushSupported());

                // Initial State
                updateState();

                // Listeners
                OneSignal.User.PushSubscription.addEventListener("change", updateState);
                OneSignal.Notifications.addEventListener("permissionChange", updateState);

            } catch (error) {
                // Suppress excessive noise for known network blocks
                console.warn("⚠️ [OneSignal] Init Failed (likely AdBlock/Network):", error);
                setIsSupported(false);
            }
        };

        if (typeof window !== 'undefined') {
            // Small delay to allow main thread to settle
            setTimeout(initOneSignal, 1000);
        }

    }, [isInitialized]);

    const updateState = useCallback(async () => {
        try {
            // Permission
            // OneSignal wraps this, but we can also use native for raw truth
            const rawPermission = Notification.permission;
            setPermission(rawPermission as PermissionState);

            // Subscription
            const subId = OneSignal.User.PushSubscription.id;
            const optedIn = OneSignal.User.PushSubscription.optedIn;

            // We consider them "Subscribed" only if they have an ID and are opted in
            if (subId && optedIn) {
                setSubscriptionId(subId);
            } else {
                setSubscriptionId(null);
            }

            // Update supported flag again just in case
            setIsSupported(OneSignal.Notifications.isPushSupported());

        } catch (e) {
            console.warn("OneSignal State Update Error", e);
        }
    }, []);

    // Handle User Identification (Login/Logout)
    useEffect(() => {
        if (!isInitialized) return;

        if (firebaseUser?.uid) {
            // Identify user
            console.log(`👤 OneSignal: Logging in as ${firebaseUser.uid}`);
            try {
                OneSignal.login(firebaseUser.uid);
            } catch (e) {
                console.warn("OneSignal login error", e);
            }
        } else {
            // Logout
            try {
                OneSignal.logout();
            } catch (e) {
                console.warn("OneSignal logout error", e);
            }
        }
    }, [firebaseUser, isInitialized]);

    // Manual Permission Prompt
    const enableNotifications = useCallback(async () => {
        if (!isInitialized) return;

        console.log("🔔 Requesting Notification Permission...");
        try {
            // This triggers the native prompt
            await OneSignal.Notifications.requestPermission();
            // Force an update after
            await updateState();
        } catch (e) {
            console.error("OneSignal Prompt Error", e);
        }
    }, [isInitialized, updateState]);

    return {
        isInitialized,
        enableNotifications,
        subscriptionId,
        permission,
        isSupported
    };
}
