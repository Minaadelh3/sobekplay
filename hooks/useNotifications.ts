import { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../lib/notificationActions';
import { onMessage } from "firebase/messaging";
import { messaging } from "../lib/firebase";
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
    const { user } = useAuth();
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if supported
        if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && messaging) {
            setIsSupported(true);
        }
    }, []);

    // Foreground listener
    useEffect(() => {
        if (!messaging) return;

        // Listen for messages while app is in foreground
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('💬 Foreground Message received:', payload);
            // Optionally show a toast or in-app UI
            // new Notification(payload.notification?.title || "New Message", { ... }) -- Note: Browser usually blocks this if focused, better to use HTML toast
        });

        return () => unsubscribe();
    }, []);

    const enableNotifications = async () => {
        if (!user) {
            console.warn("User must be logged in to enable notifications.");
            return;
        }
        const token = await requestNotificationPermission(user.id);
        setPermissionStatus(Notification.permission);
        return token;
    };

    return {
        permissionStatus,
        enableNotifications,
        isSupported
    };
};
