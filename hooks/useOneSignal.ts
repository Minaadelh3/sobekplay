import { useEffect, useState, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '../context/AuthContext';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

export function useOneSignal() {
    const { firebaseUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

    // Initialize OneSignal
    useEffect(() => {
        if (!ONESIGNAL_APP_ID) {
            console.error("OneSignal App ID is missing. Check .env");
            return;
        }

        if (isInitialized) return;

        const initOneSignal = async () => {
            console.log("🔔 [OneSignal] Initializing with App ID:", ONESIGNAL_APP_ID);

            if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID.length < 10) {
                console.error("❌ [OneSignal] App ID invalid or too short.");
                return;
            }

            try {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    // Use the main PWA worker which imports OneSignal scripts
                    serviceWorkerPath: 'sw.js',
                    serviceWorkerParam: { scope: '/' },
                    // We handle prompting manually
                    promptOptions: {
                        slidedown: {
                            prompts: []
                        }
                    },
                });

                setIsInitialized(true);
                console.log("✅ OneSignal Initialized");

                // Get current subscription state
                const state = await OneSignal.User.PushSubscription.id;
                setSubscriptionId(state || null);

                // Listen for subscription changes
                OneSignal.User.PushSubscription.addEventListener("change", (event) => {
                    setSubscriptionId(event.current.id || null);
                });

            } catch (error) {
                console.error("❌ OneSignal Init Error:", error);
            }
        };

        if (typeof window !== 'undefined') {
            initOneSignal();
        }

    }, [isInitialized]);

    // Handle User Identification (Login/Logout)
    useEffect(() => {
        if (!isInitialized) return;

        if (firebaseUser?.uid) {
            // Identify user
            // Note: v16 SDK uses OneSignal.login, older used setExternalUserId.
            // react-onesignal usually wraps v16+.
            console.log(`👤 OneSignal: Logging in as ${firebaseUser.uid}`);
            try {
                OneSignal.login(firebaseUser.uid);
            } catch (e) {
                console.warn("OneSignal.login failed, trying setExternalUserId fallback", e);
                // Fallback if older SDK version
                // @ts-ignore
                if (OneSignal.setExternalUserId) OneSignal.setExternalUserId(firebaseUser.uid);
            }
        } else {
            // Logout
            console.log("👤 OneSignal: Logging out");
            try {
                OneSignal.logout();
            } catch (e) {
                console.warn("OneSignal.logout failed", e);
            }
        }
    }, [firebaseUser, isInitialized]);

    // Manual Permission Prompt
    const enableNotifications = useCallback(async () => {
        if (!isInitialized) return;

        console.log("🔔 Requesting Notification Permission...");
        try {
            await OneSignal.Slidedown.promptPush();
        } catch (e) {
            console.error("OneSignal Prompt Error", e);
            // Fallback to native prompt if slidedown fails/not configured
            await OneSignal.Notifications.requestPermission();
        }
    }, [isInitialized]);

    return {
        isInitialized,
        enableNotifications,
        subscriptionId
    };
}
