import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, query, orderBy, where, doc, updateDoc, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
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
    scoreTotal?: number;
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
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const userData = userSnap.data() as AdminUser;
            const currentTeamId = userData.teamId;
            const pointsToTransfer = userData.scoreTotal || userData.points || 0;

            if (currentTeamId === teamId) return;

            // 1. If User has points, move them between teams
            if (pointsToTransfer > 0) {
                // Case A: Moving from Team to Team
                if (currentTeamId && teamId && currentTeamId !== 'freelancer' && teamId !== 'freelancer') {
                    await performTransaction({
                        type: 'TRANSFER',
                        amount: pointsToTransfer,
                        from: { type: 'TEAM', id: currentTeamId, name: teams.find(t => t.id === currentTeamId)?.name || currentTeamId },
                        to: { type: 'TEAM', id: teamId, name: teams.find(t => t.id === teamId)?.name || teamId },
                        reason: `Member Transfer: ${userData.name || uid}`,
                        adminId: auth.currentUser?.uid
                    });
                }
                // Case B: Moving from Freelancer (No Team) to Team -> ADD to New Team
                else if ((!currentTeamId || currentTeamId === 'freelancer') && teamId && teamId !== 'freelancer') {
                    await performTransaction({
                        type: 'ADJUSTMENT',
                        amount: pointsToTransfer,
                        from: { type: 'SYSTEM', id: 'transfer_center', name: 'Transfer Import' },
                        to: { type: 'TEAM', id: teamId, name: teams.find(t => t.id === teamId)?.name || teamId },
                        reason: `Member Join (Points Import): ${userData.name || uid}`,
                        adminId: auth.currentUser?.uid
                    });
                }
                // Case C: Moving from Team to Freelancer -> DEDUCT from Old Team
                else if (currentTeamId && currentTeamId !== 'freelancer' && (!teamId || teamId === 'freelancer')) {
                    await performTransaction({
                        type: 'ADJUSTMENT',
                        amount: pointsToTransfer,
                        from: { type: 'TEAM', id: currentTeamId, name: teams.find(t => t.id === currentTeamId)?.name || currentTeamId },
                        to: { type: 'SYSTEM', id: 'transfer_center', name: 'Transfer Export' },
                        reason: `Member Departure: ${userData.name || uid}`,
                        adminId: auth.currentUser?.uid
                    });
                }
            }

            // 2. Update User's Team ID
            await updateDoc(userRef, { teamId: teamId });
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, teamId: teamId } : u));

            await setDoc(doc(collection(db, "admin_logs")), {
                action: "ASSIGN_TEAM",
                targetUid: uid,
                newTeam: teamId,
                pointsMoved: pointsToTransfer,
                adminId: auth.currentUser?.uid,
                timestamp: serverTimestamp()
            });

            // Refresh teams to show new scores on UI
            await fetchTeams();

        } catch (e) {
            console.error("Failed to assign team", e);
            alert("فشل نقل العضو");
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
        const diff = newPoints - (teams.find(t => t.id === teamId)?.scoreTotal || teams.find(t => t.id === teamId)?.points || 0);
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

    const updateTeamProfile = async (teamId: string, updates: Partial<{ name: string, description: string, color: string, avatar: string, isScorable: boolean, pin: string }>) => {
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

    const assignRole = async (uid: string, newRole: string) => {
        if (!confirm(`Are you sure you want to promote/demote this user to ${newRole}?`)) return;

        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });

            // Fix: Cast to any or explicit UserRole to satisfy TS
            const roleTyped = newRole as any;
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: roleTyped } : u));

            await setDoc(doc(collection(db, "admin_logs")), {
                action: "ASSIGN_ROLE",
                targetUid: uid,
                newRole: newRole,
                adminId: auth.currentUser?.uid,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Failed to assign role", e);
            alert("فشل تحديث الصلاحية");
            return false;
        }
    };

    const updateUserStats = async (uid: string, stats: { points?: number, xp?: number }) => {
        try {
            await updateDoc(doc(db, "users", uid), stats);
            setUsers(prev => prev.map(u => u.id === uid ? { ...u, ...stats } : u));
            await setDoc(doc(collection(db, "admin_logs")), {
                action: "UPDATE_STATS_DIRECT",
                targetUid: uid,
                updates: stats,
                adminId: auth.currentUser?.uid,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Failed to update stats", e);
            alert("فشل تحديث البيانات");
            return false;
        }
    };

    const sendTeamBroadcast = async (teamId: string, message: string) => {
        try {
            await setDoc(doc(collection(db, "system_messages")), {
                message,
                targetTeam: teamId,
                type: 'team_broadcast',
                sender: 'System',
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h Expiry
            });

            await setDoc(doc(collection(db, "admin_logs")), {
                action: "TEAM_BROADCAST",
                targetTeam: teamId,
                message: message,
                adminId: auth.currentUser?.uid,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error("Broadcast Failed", e);
            alert("فشل إرسال الرسالة");
            return false;
        }
    };

    const deleteUser = async (uid: string) => {
        if (!confirm("⚠️ FINAL WARNING: This will permanently delete this user data. This cannot be undone.")) return;

        try {
            // 1. Delete from Firestore (or Mark Deleted if you want to keep history)
            // Requirement says "delete completely".
            await deleteDoc(doc(db, "users", uid));

            // 2. Log it
            await setDoc(doc(collection(db, "admin_logs")), {
                action: "DELETE_USER_PERMANENT",
                targetUid: uid,
                adminId: auth.currentUser?.uid,
                timestamp: serverTimestamp()
            });

            // 3. Update Local State
            setUsers(prev => prev.filter(u => u.id !== uid));
            return true;
        } catch (e) {
            console.error("Delete failed", e);
            alert("فشل الحذف");
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
        assignRole,
        updateUserStats,
        sendTeamBroadcast,
        uploadUserAvatar,
        updateUserName,
        updateTeamProfile,
        deleteUser,
        triggerForceRefresh: async () => {
            try {
                await setDoc(doc(db, "system_settings", "global_config"), {
                    forceRefreshAt: serverTimestamp()
                }, { merge: true });
                return true;
            } catch (e) {
                console.error("Force Refresh Trigger Failed", e);
                alert("فشل إرسال أمر التحديث");
                return false;
            }
        }
    };
}
