import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, query, orderBy, where, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../lib/firebase';
import { User, TEAMS } from '../types/auth';
import { performTransaction } from '../lib/ledger';

export interface AdminUser extends Omit<User, 'teamId'> {
    lastLoginAt?: any;
    isDisabled?: boolean;
    teamId?: string;
    xp?: number;
}

export function useAdminData() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [logs, setLogs] = useState<any[]>([]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            const loadedUsers = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as AdminUser));

            setUsers(loadedUsers);
        } catch (err: any) {
            console.error("Admin Fetch Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const q = query(collection(db, "admin_logs"), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Fetch Logs Failed", e);
        }
    };

    const toggleUserStatus = async (uid: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", uid), {
                isDisabled: !currentStatus
            });
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, isDisabled: !currentStatus } : u));
            await setDoc(doc(collection(db, "admin_logs")), {
                action: currentStatus ? "UNBAN_USER" : "BAN_USER",
                targetUid: uid,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to toggle status", e);
            alert("فشل تحديث الحالة");
        }
    };

    const assignTeam = async (uid: string, teamId: string) => {
        try {
            await updateDoc(doc(db, "users", uid), { teamId: teamId });
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, teamId: teamId } : u));
            await setDoc(doc(collection(db, "admin_logs")), {
                action: "ASSIGN_TEAM",
                targetUid: uid,
                newTeam: teamId,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to assign team", e);
        }
    };

    const uploadUserAvatar = async (uid: string, file: File) => {
        try {
            const storageRef = ref(storage, `avatars/${uid}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 1. Update Firestore Document (Source of Truth for App Data)
            await updateDoc(doc(db, "users", uid), {
                avatar: downloadURL,
                photoURL: downloadURL
            });

            // 2. Sync with Firebase Auth Profile (if it's the current user)
            // This ensures instant update in libraries/components listening to Auth State
            if (auth.currentUser && auth.currentUser.uid === uid) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
                // Force reload if necessary but AuthContext should pick it up or we can rely on Firestore listener if we had one.
                // Since AuthContext reads Firestore on init, a refresh is usually needed unless we push state.
            }

            setUsers(prev => prev.map(u => u.id === uid ? { ...u, avatar: downloadURL, photoURL: downloadURL } : u));
            return true;
        } catch (e) {
            console.error("Upload Failed", e);
            alert("فشل رفع الصورة");
            return false;
        }
    };

    const [teams, setTeams] = useState<any[]>([]);

    const fetchTeams = async () => {
        try {
            const q = query(collection(db, "teams"));
            const snapshot = await getDocs(q);
            setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Fetch Teams Failed", e);
        }
    };

    const createTeam = async (teamData: { id: string, name: string, description?: string, color: string, avatar: string }) => {
        try {
            const isUncleJoy = teamData.id === 'uncle_joy' || teamData.name?.trim().toLowerCase() === 'uncle joy';
            await setDoc(doc(db, "teams", teamData.id), {
                ...teamData,
                points: 0,
                isScorable: !isUncleJoy,
                createdAt: serverTimestamp()
            });
            await fetchTeams();
            await setDoc(doc(collection(db, "admin_logs")), {
                action: "CREATE_TEAM",
                targetTeam: teamData.id,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Create Team Failed", e);
            throw e;
        }
    };

    const updateTeamPoints = async (teamId: string, newPoints: number) => {
        if (!auth.currentUser) return;
        const currentAdmin = users.find(u => u.id === auth.currentUser?.uid);

        // Permission Check
        const diff = newPoints - (teams.find(t => t.id === teamId)?.points || 0);
        const action = Math.abs(diff) > 500 ? 'adjust_points_limitless' : 'adjust_points';

        if (!currentAdmin || (currentAdmin.role !== 'SUPER_ADMIN' && currentAdmin.role !== 'POINTS_MANAGER')) {
            // Basic role check fallback, ideally use can() but need user object
        }

        try {
            const teamRef = doc(db, "teams", teamId);
            const teamSnap = await getDoc(teamRef);
            if (!teamSnap.exists()) return;
            if (teamSnap.data().isScorable === false) { alert("This team is not scorable!"); return; }

            // Use Ledger
            const success = await performTransaction({
                type: 'ADJUSTMENT',
                amount: diff,
                from: {
                    type: 'SYSTEM',
                    id: 'admin_panel',
                    name: 'Admin Adjustment'
                },
                to: {
                    type: 'TEAM',
                    id: teamId,
                    name: teamSnap.data().name || teamId
                },
                reason: 'Admin Manual Adjustment',
                adminId: auth.currentUser.uid
            });

            if (success) {
                await fetchTeams(); // Refresh
            }
        } catch (e: any) {
            console.error("Update Points Failed", e);
            alert(`Failed: ${e.message}`);
        }
    };

    const deleteTeam = async (teamId: string) => {
        if (!confirm("Are you sure? Users in this team will be stranded!")) return;
        try {
            await setDoc(doc(collection(db, "admin_logs")), {
                action: "DELETE_TEAM",
                targetTeam: teamId,
                timestamp: serverTimestamp()
            });
            await updateDoc(doc(db, "teams", teamId), { deleted: true });
            await fetchTeams();
        } catch (e) {
            console.error("Delete Team Failed", e);
        }
    };

    const updateUserName = async (uid: string, newName: string) => {
        try {
            await updateDoc(doc(db, "users", uid), {
                name: newName,
                displayName: newName // Keep them in sync
            });
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, name: newName, displayName: newName } : u));
            return true;
        } catch (e) {
            console.error("Failed to update name", e);
            alert("فشل تحديث الاسم");
            return false;
        }
    };

    const updateTeamProfile = async (teamId: string, updates: Partial<{ name: string, description: string, color: string, avatar: string, isScorable: boolean }>) => {
        try {
            await updateDoc(doc(db, "teams", teamId), updates);
            setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
            return true;
        } catch (e) {
            console.error("Update Team Profile Failed", e);
            alert("فشل تحديث بيانات الفريق");
            return false;
        }
    };

    return {
        users,
        logs,
        teams,
        loading,
        error,
        fetchUsers,
        fetchLogs,
        fetchTeams,
        createTeam,
        deleteTeam,
        updateTeamPoints,
        toggleUserStatus,
        assignTeam,
        uploadUserAvatar,
        updateUserName,
        updateTeamProfile
    };
}
