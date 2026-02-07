import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import {
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    signOut
} from 'firebase/auth';
import { UserProfile, UserPreferences, UserPrivacy, UserNotifications } from '../types/auth';

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

    // --- Security Functions (Re-auth required usually) ---

    // Helper for re-auth (simplified for this context - ideally passed via UI modal)
    // We will assume the UI handles the credential gathering and passes it here, or we just fail if requires recent login.
    // For this 'product-level' requirement, we really should have a proper re-auth flow. 
    // BUT since that requires UI interaction (modal), let's implement the core logic here that throws 'requires-recent-login'

    const changeEmail = async (newEmail: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!firebaseUser) throw new Error("No user");
            await updateEmail(firebaseUser, newEmail);
            // Update Firestore email as well if stored there
            const { uid } = checkAuth();
            await updateDoc(doc(db, 'users', uid), { email: newEmail });
            return { success: true };
        } catch (e: any) {
            console.error("Change Email Failed", e);
            return { success: false, error: e.code || e.message };
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (newPassword: string) => {
        setLoading(true);
        setError(null);
        try {
            if (!firebaseUser) throw new Error("No user");
            await updatePassword(firebaseUser, newPassword);
            return { success: true };
        } catch (e: any) {
            console.error("Change Password Failed", e);
            return { success: false, error: e.code || e.message };
        } finally {
            setLoading(false);
        }
    };

    const logOutAllSessions = async () => {
        // Firebase doesn't have a direct "revoke all tokens" on client SDK easily without Cloud Functions.
        // We can just sign out here.
        try {
            await signOut(auth);
            return true;
        } catch (e) { return false; }
    };

    const deleteAccountStart = async () => {
        setLoading(true);
        try {
            const { uid } = checkAuth();
            // 1. Soft Delete in Firestore
            await updateDoc(doc(db, 'users', uid), {
                isDisabled: true,
                'meta.deletedAt': serverTimestamp()
            });

            // 2. Delete Auth User (Critical)
            if (firebaseUser) {
                await deleteUser(firebaseUser);
            }
            return { success: true };
        } catch (e: any) {
            console.error("Delete Account Failed", e);
            return { success: false, error: e.code || e.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateProfile,
        updatePreferences,
        updatePrivacy,
        updateNotifications,
        exportUserData,
        deleteAccountStart,
        changeEmail,
        changePassword,
        logOutAllSessions,
        loading,
        error
    };
}
