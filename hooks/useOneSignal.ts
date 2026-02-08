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
            // 1. Abort if Offline
            if (typeof window !== 'undefined' && !navigator.onLine) {
                console.log("📴 [OneSignal] Offline, skipping init.");
                return;
            }

            console.log("🔔 [OneSignal] Initializing...");

            try {
                // 2. Initialize with specific worker path
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    // IMPORTANT: Point to the file created in public/
                    serviceWorkerPath: 'OneSignalSDKWorker.js',
                    serviceWorkerParam: { scope: '/' },
                    promptOptions: {
                        slidedown: {
                            prompts: [
                                {
                                    type: "push",
                                    autoPrompt: false, // We will trigger manually or via specific UI flow
                                    text: {
                                        actionMessage: "Get notified about new games and updates!",
                                        acceptButton: "Allow",
                                        cancelButton: "Later"
                                    },
                                    delay: {
                                        pageViews: 1,
                                        timeDelay: 30
                                    }
                                }
                            ]
                        }
                    },
                });

                setIsInitialized(true);
                setIsSupported(OneSignal.Notifications.isPushSupported());

                // Initial State
                updateState();

                // Listeners
                OneSignal.User.PushSubscription.addEventListener("change", updateState);
                OneSignal.Notifications.addEventListener("permissionChange", updateState);

            } catch (error) {
                console.warn("⚠️ [OneSignal] Init Failed:", error);
                // Don't disable support flag based on init failure alone, as it might be network
            }
        };

        if (typeof window !== 'undefined') {
            // Small delay to ensure page load
            setTimeout(initOneSignal, 1000);
        }

    }, [isInitialized]);

    const updateState = useCallback(async () => {
        try {
            // Permission
            const rawPermission = Notification.permission;
            setPermission(rawPermission as PermissionState);

            // Subscription
            const subId = OneSignal.User.PushSubscription.id;
            const optedIn = OneSignal.User.PushSubscription.optedIn;

            if (subId && optedIn) {
                setSubscriptionId(subId);
            } else {
                setSubscriptionId(null);
            }

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
                // Add default tags
                OneSignal.User.addTags({
                    user_type: 'registered',
                    last_login: new Date().toISOString()
                });
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
            // This triggers the native prompt or slidedown depending on config
            await OneSignal.Notifications.requestPermission();
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
