import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserPreferences, UserPrivacy, UserNotifications } from '../types/auth'; // Ensure these are exported from types/auth

export function useSettings() {
    const { user, firebaseUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = () => {
        if (!firebaseUser || !user) throw new Error("User not authenticated");
        return { uid: firebaseUser.uid };
    };

    const updateProfile = async (profileData: Partial<UserProfile>) => {
        setLoading(true);
        setError(null);
        try {
            const { uid } = checkAuth();

            // Construct the update object with dot notation for nested fields
            const updates: Record<string, any> = {
                'meta.lastUpdated': serverTimestamp()
            };

            // Map profile fields
            Object.keys(profileData).forEach(key => {
                const k = key as keyof UserProfile;
                if (profileData[k] !== undefined) {
                    updates[`profile.${key}`] = profileData[k];
                }
            });

            await updateDoc(doc(db, 'users', uid), updates);
            return true;
        } catch (e: any) {
            console.error("Profile update failed", e);
            setError(e.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (prefs: Partial<UserPreferences>) => {
        try {
            const { uid } = checkAuth();
            const updates: Record<string, any> = {};
            Object.keys(prefs).forEach(key => {
                const k = key as keyof UserPreferences;
                if (prefs[k] !== undefined) {
                    updates[`preferences.${key}`] = prefs[k];
                }
            });
            await updateDoc(doc(db, 'users', uid), updates);
            return true;
        } catch (e) {
            console.error("Prefs update failed", e);
            return false;
        }
    };

    const updatePrivacy = async (privacy: Partial<UserPrivacy>) => {
        try {
            const { uid } = checkAuth();
            const updates: Record<string, any> = {};
            Object.keys(privacy).forEach(key => {
                const k = key as keyof UserPrivacy;
                if (privacy[k] !== undefined) {
                    updates[`privacy.${key}`] = privacy[k];
                }
            });
            await updateDoc(doc(db, 'users', uid), updates);
            return true;
        } catch (e) {
            console.error("Privacy update failed", e);
            return false;
        }
    };

    const updateNotifications = async (notif: Partial<UserNotifications>) => {
        try {
            const { uid } = checkAuth();
            const updates: Record<string, any> = {};
            Object.keys(notif).forEach(key => {
                const k = key as keyof UserNotifications;
                if (notif[k] !== undefined) {
                    updates[`notifications.${key}`] = notif[k];
                }
            });
            await updateDoc(doc(db, 'users', uid), updates);
            return true;
        } catch (e) {
            console.error("Notif update failed", e);
            return false;
        }
    };

    const exportUserData = () => {
        if (!user) return;
        const dataStr = JSON.stringify(user, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sobek_data_${user.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Danger Zone
    const deleteAccountStart = async () => {
        // Soft delete or just flag
        // Real deletion requires re-auth usually.
        // For this scope, we might just set 'isDisabled: true'
        const { uid } = checkAuth();
        await updateDoc(doc(db, 'users', uid), {
            isDisabled: true,
            'meta.deletedAt': serverTimestamp()
        });
        // In a real app we'd call deleteUser(auth.currentUser) but that requires precise error handling
    };

    return {
        updateProfile,
        updatePreferences,
        updatePrivacy,
        updateNotifications,
        exportUserData,
        deleteAccountStart,
        loading,
        error
    };
}
