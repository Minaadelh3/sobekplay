
import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { auth } from '../lib/firebase';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<string>('default');
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Safe access to window
        if (typeof window === 'undefined') return;

        const checkStatus = async () => {
            try {
                // Check if initialized (basic check)
                // @ts-ignore
                if (window.OneSignal) {
                    setIsInitialized(true);

                    // Get Permission
                    // @ts-ignore
                    const perm = window.OneSignal.Notifications?.permission || Notification.permission;
                    setPermission(perm ? "granted" : "default"); // Simplify for status

                    // Get Subscription ID
                    // @ts-ignore
                    const id = await OneSignal.User.PushSubscription.id;
                    setSubscriptionId(id || null);
                }
            } catch (e) {
                console.warn("OneSignal Status Check Failed:", e);
            }
        };

        checkStatus();

        // Poll briefly for changes (e.g. after prompt)
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);

    }, []);

    const promptPush = async () => {
        try {
            // @ts-ignore
            await OneSignal.Slidedown.promptPush();
        } catch (e) {
            console.error("Prompt Failed:", e);
        }
    };


    // Compatibility Interfaces
    interface PushPayload {
        title: string;
        message: string;
        url?: string;
        imageUrl?: string;
        audience: any;
        sendAfter?: string;
    }

    return {
        permission,
        subscriptionId,
        isInitialized,
        promptPush,
        // Legacy props for compatibility during refactor
        loading: false,
        error: null,
        sendPush: async (payload: PushPayload) => {
            try {
                // Get token from Firebase Auth
                const token = await auth?.currentUser?.getIdToken();

                const res = await fetch('/api/push/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to send push');
                }

                return await res.json();
            } catch (e: any) {
                console.error("Push Send Error:", e);
                alert(`Error sending push: ${e.message}`);
                throw e;
            }
        },
        schedulePush: async (payload: PushPayload) => {
            try {
                // Get token from Firebase Auth
                const token = await auth?.currentUser?.getIdToken();

                const res = await fetch('/api/push/schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to schedule push');
                }

                return await res.json();
            } catch (e: any) {
                console.error("Push Schedule Error:", e);
                alert(`Error scheduling push: ${e.message}`);
                throw e;
            }
        },
        getHistory: async () => {
            try {
                const token = await auth?.currentUser?.getIdToken();

                const res = await fetch('/api/push/history', {
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch history');
                return (await res.json()).data || [];
            } catch (e) {
                console.warn("Fetch History Failed", e);
                return [];
            }
        },
        getUsersStats: async () => {
            try {
                const token = await auth?.currentUser?.getIdToken();

                const res = await fetch('/api/push/users', {
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch stats');
                // Fix: Ensure we return the expected structure { stats: {...}, users: [], segments: [] }
                // The API returns { data: { stats: ..., users: ..., segments: ... } } usually if using sendSuccess
                const json = await res.json();
                return json.data || { stats: { total_users: 0, messageable_users: 0 }, users: [] };
            } catch (e) {
                console.warn("Fetch Stats Failed", e);
                return { stats: { total_users: 0, messageable_users: 0 }, users: [] };
            }
        },
        checkHealth: async () => {
            try {
                const res = await fetch('/api/health');
                return await res.json();
            } catch (e) {
                return { status: 'error' };
            }
        }
    };
};

