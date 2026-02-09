import { useEffect, useState, useCallback } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '../context/AuthContext';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "71f9b370-fb2a-4da8-9377-d0546c5900c0";

type PermissionState = 'default' | 'granted' | 'denied';

// Module-level flag to prevent double init across multiple component mounts
let didInitOneSignal = false;

export function useOneSignal() {
    const { firebaseUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(didInitOneSignal);
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [permission, setPermission] = useState<PermissionState>('default');
    const [isSupported, setIsSupported] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
        console.log(`[PushDebug] ${msg}`);
    }, []);

    const updateState = useCallback(async () => {
        try {
            // Permission
            const rawPermission = Notification.permission;
            setPermission(rawPermission as PermissionState);

            // Subscription
            const subId = OneSignal.User.PushSubscription.id;
            const optedIn = OneSignal.User.PushSubscription.optedIn;

            setIsOptedIn(!!optedIn);

            if (subId) {
                setSubscriptionId(subId);
            } else {
                setSubscriptionId(null);
            }

            setIsSupported(OneSignal.Notifications.isPushSupported());

        } catch (e) {
            console.warn("OneSignal State Update Error", e);
        }
    }, []);

    // ... (rest of the file)


    // Initialize OneSignal
    const initOneSignal = useCallback(async () => {
        // 1. Abort if Offline
        if (typeof window !== 'undefined' && !navigator.onLine) {
            console.log("📴 [OneSignal] Offline, skipping init.");
            return;
        }

        console.log("🔔 [OneSignal] Initializing...");
        didInitOneSignal = true; // Mark as started to prevent race conditions

        try {
            // 2. Initialize with specific worker path
            await OneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
                // IMPORTANT: We use the main sw.js which imports OneSignal scripts
                serviceWorkerPath: '/sw.js',
                serviceWorkerParam: { scope: '/' },
                promptOptions: {
                    slidedown: {
                        prompts: [
                            {
                                type: "push",
                                autoPrompt: false,
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
                }
            });

            if (addLog) addLog("OneSignal.init completed");
            setIsInitialized(true);
            setIsSupported(OneSignal.Notifications.isPushSupported());

            // Initial State
            updateState();

            // Listeners
            OneSignal.User.PushSubscription.addEventListener("change", (e) => {
                if (addLog) addLog("Subscription Changed Event");
                updateState();
            });
            OneSignal.Notifications.addEventListener("permissionChange", (permission) => {
                if (addLog) addLog(`Permission Changed: ${permission}`);
                updateState();
            });

        } catch (error: any) {
            console.warn("⚠️ [OneSignal] Init Failed:", error);

            // If it failed because already initialized, recovers gracefully
            if (error?.message?.includes("already initialized") || error?.includes?.("already initialized")) {
                console.log("Recovering from double-init...");
                setIsInitialized(true);
                updateState();
            } else {
                if (addLog) addLog(`Init Failed: ${error}`);
                didInitOneSignal = false; // Reset on genuine failure so we can try again
            }
        }
    }, [ONESIGNAL_APP_ID, addLog, updateState]);

    useEffect(() => {
        if (!ONESIGNAL_APP_ID) {
            console.error("OneSignal App ID is missing. Check .env");
            return;
        }

        // If already initialized globally, just update local state
        if (didInitOneSignal) {
            setIsInitialized(true);
            updateState();
            return;
        }

        if (typeof window !== 'undefined' && !didInitOneSignal) {
            // Small delay to ensure page load
            setTimeout(initOneSignal, 1000);
        }

    }, [isInitialized, updateState, initOneSignal]);

    // Handle User Identification (Login/Logout)
    useEffect(() => {
        if (!isInitialized) return;

        if (firebaseUser?.uid) {
            // Identify user
            addLog(`Logging in as ${firebaseUser.uid}`);
            try {
                OneSignal.login(firebaseUser.uid);
                // Add default tags
                OneSignal.User.addTags({
                    user_type: 'registered',
                    last_login: new Date().toISOString()
                });
            } catch (e) {
                console.warn("OneSignal login error", e);
                addLog(`Login Error: ${e}`);
            }
        } else {
            // Logout
            try {
                OneSignal.logout();
            } catch (e) {
                console.warn("OneSignal logout error", e);
            }
        }
    }, [firebaseUser, isInitialized, addLog]);

    // Manual Permission Prompt
    const enableNotifications = useCallback(async () => {
        if (!isInitialized) return;

        addLog("Requesting Notification Permission/Subscription...");
        console.log("Debug Subscription State:", OneSignal.User.PushSubscription);
        addLog(`Current State - ID: ${OneSignal.User.PushSubscription.id}, OptedIn: ${OneSignal.User.PushSubscription.optedIn}`);

        try {
            if (permission === 'granted') {
                addLog("Permission already granted. Attempting opt-in...");
                await OneSignal.User.PushSubscription.optIn();
            } else {
                await OneSignal.Notifications.requestPermission();
            }
            await updateState();
        } catch (e) {
            console.error("OneSignal Prompt Error", e);
            addLog(`Prompt Error: ${e}`);
        }
    }, [isInitialized, permission, updateState, addLog]);

    return {
        isInitialized,
        enableNotifications,
        subscriptionId,
        isOptedIn,
        permission,
        isSupported,
        logs,
        addLog
    };
}
