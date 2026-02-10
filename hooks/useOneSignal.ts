import { useEffect, useState, useCallback, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '../context/AuthContext';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "71f9b370-fb2a-4da8-9377-d0546c5900c0";

type PermissionState = 'default' | 'granted' | 'denied';

// Global initialization flag to prevent double-init in React Strict Mode
let isOneSignalInitializing = false;
let isOneSignalInitialized = false;

export function useOneSignal() {
    const { firebaseUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(isOneSignalInitialized);
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [permission, setPermission] = useState<PermissionState>(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission as PermissionState;
        }
        return 'default';
    });
    const [isSupported, setIsSupported] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    // Use refs to track latest state for event listeners
    const isInitializedRef = useRef(isInitialized);
    isInitializedRef.current = isInitialized;

    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMsg = `[${timestamp}] ${msg}`;
        setLogs(prev => [logMsg, ...prev]);
        console.log(`🔔 [OneSignal] ${msg}`);
    }, []);

    const updateState = useCallback(async () => {
        try {
            // Permission
            const rawPermission = Notification.permission;
            setPermission(rawPermission as PermissionState);

            // Subscription
            // Note: We access these safely. if OneSignal isn't loaded, these might throw or be undefined depending on the SDK version, 
            // but react-onesignal usually handles the shim.
            if (OneSignal.User?.PushSubscription) {
                const subId = OneSignal.User.PushSubscription.id;
                const optedIn = OneSignal.User.PushSubscription.optedIn;

                setIsOptedIn(!!optedIn);
                setSubscriptionId(subId || null);
            }

            if (OneSignal.Notifications) {
                setIsSupported(OneSignal.Notifications.isPushSupported());
            }

        } catch (e) {
            console.warn("OneSignal State Update Error", e);
        }
    }, []);

    // Initialize OneSignal
    useEffect(() => {
        if (!ONESIGNAL_APP_ID) {
            console.error("OneSignal App ID is missing. Check .env");
            return;
        }

        // If already initialized, just ensure local state is up to date
        if (isOneSignalInitialized) {
            setIsInitialized(true);
            updateState();
            return;
        }

        // If currently initializing, wait for it (simplified: just return, local state will update when re-rendered or we can poll)
        if (isOneSignalInitializing) return;

        const init = async () => {
            if (typeof window === 'undefined') return;
            if (!navigator.onLine) {
                addLog("Offline, skipping init.");
                return;
            }

            isOneSignalInitializing = true;
            addLog("Initializing...");

            try {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerPath: '/OneSignalSDKWorker.js', // Explicit path to public worker
                    // serviceWorkerParam: { scope: '/' }, // Usually not needed if worker is at root
                });

                isOneSignalInitialized = true;
                setIsInitialized(true);
                addLog("Init verified.");

                // Initial update
                updateState();

                // Setup Listeners
                OneSignal.User.PushSubscription.addEventListener("change", (e) => {
                    addLog(`Subscription Changed: ${JSON.stringify(e)}`);
                    updateState();
                });

                OneSignal.Notifications.addEventListener("permissionChange", (permission) => {
                    addLog(`Permission Changed: ${permission}`);
                    updateState();
                });

            } catch (error: any) {
                console.error("OneSignal Init Failed:", error);
                addLog(`Init Failed: ${error?.message || error}`);
                isOneSignalInitializing = false; // Allow retry
            }
        };

        init();
    }, [addLog, updateState]);

    // Handle User Identification (Login/Logout)
    useEffect(() => {
        if (!isInitialized || !firebaseUser) return;

        // Login logic
        const currentExternalId = OneSignal.User.externalId;
        if (currentExternalId !== firebaseUser.uid) {
            addLog(`Logging in as ${firebaseUser.uid}`);
            OneSignal.login(firebaseUser.uid);
            OneSignal.User.addTags({
                user_type: 'registered',
                last_login: new Date().toISOString()
            });
        }
    }, [isInitialized, firebaseUser, addLog]);

    // Handle Logout
    useEffect(() => {
        if (!isInitialized || firebaseUser) return;

        // If no user, but we have an external ID, logout
        const currentExternalId = OneSignal.User.externalId;
        if (currentExternalId) {
            addLog("Logging out");
            OneSignal.logout();
        }
    }, [isInitialized, firebaseUser, addLog]);


    // Manual Permission Prompt
    const enableNotifications = useCallback(async () => {
        if (!isInitialized) {
            addLog("Cannot enable: Not initialized yet");
            return;
        }

        addLog("Requesting Permission...");

        try {
            // If already granted but opted out, opt back in
            if (Notification.permission === 'granted') {
                const isOptedIn = OneSignal.User.PushSubscription.optedIn;
                if (!isOptedIn) {
                    addLog("Permission granted, opting in...");
                    await OneSignal.User.PushSubscription.optIn();
                } else {
                    addLog("Already granted and opted in.");
                }
            } else {
                // Request permission
                await OneSignal.Notifications.requestPermission();
            }

            // Force update state after a short delay to allow SDK to propagate
            setTimeout(updateState, 500);

        } catch (e) {
            console.error("OneSignal Prompt Error", e);
            addLog(`Prompt Error: ${e}`);
        }
    }, [isInitialized, updateState, addLog]);

    const disableNotifications = useCallback(async () => {
        if (!isInitialized) return;
        addLog("Opting out...");
        await OneSignal.User.PushSubscription.optOut();
        updateState();
    }, [isInitialized, updateState, addLog]);

    return {
        isInitialized,
        enableNotifications,
        disableNotifications,
        subscriptionId,
        isOptedIn,
        permission,
        isSupported,
        logs,
        addLog
    };
}
