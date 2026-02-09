import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, writeBatch, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { TeamId } from '../types/store';

export function useGodMode() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Helper to log actions
    const logAction = async (action: string, details: any) => {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                action,
                details,
                adminId: user?.id || 'unknown',
                adminName: user?.name || 'God Mode',
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    };

    // 1. Update Team Score (Direct +/-)
    const updateTeamScore = async (teamId: string, delta: number) => {
        if (!user) return;
        setLoading(true);
        try {
            // We need to read current score first to increment? 
            // Actually firestore increment is safer.
            const { increment } = await import('firebase/firestore');

            const teamRef = doc(db, 'teams', teamId);
            await updateDoc(teamRef, {
                points: increment(delta)
            });

            await logAction('MANUAL_SCORE_ADJUST', { teamId, delta });
        } catch (error) {
            console.error("God Mode Update Failed:", error);
            alert("Failed to update score.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Reset Single Team
    const resetTeam = async (teamId: string) => {
        if (!confirm(`⚠️ ARE YOU SURE?\n\nThis will reset team '${teamId}' score to ZERO.\nThis action cannot be undone.`)) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, 'teams', teamId), { points: 0 });
            await logAction('TEAM_RESET', { teamId });
        } catch (error) {
            console.error("Team Reset Failed:", error);
            alert("Failed to reset team.");
        } finally {
            setLoading(false);
        }
    };

    // 3. GLOBAL SEASON RESET (The Nuke)
    const resetSeason = async () => {
        const confirmPhrase = "RESET SEASON";
        const input = prompt(`🚨 NUCLEAR OPTION 🚨\n\nThis will:\n1. Reset ALL Team scores to 0.\n2. Reset ALL User points to 0.\n3. Wipe ALL User badges.\n\nType "${confirmPhrase}" to confirm:`);

        if (input !== confirmPhrase) {
            alert("Reset Cancelled. Phrase did not match.");
            return;
        }

        setLoading(true);
        try {
            // 1. Reset Teams
            const teamBatch = writeBatch(db);
            const teamsSnap = await getDocs(collection(db, 'teams'));
            teamsSnap.docs.forEach(d => {
                teamBatch.update(d.ref, { points: 0 });
            });
            await teamBatch.commit();

            // 2. Reset Users (Chunked Batches because limits are 500 ops)
            // Note: This is client-side intense. Ideally use Cloud Function.
            // But strict requirement: "Implement EVERYTHING you technically can by yourself."
            const usersSnap = await getDocs(collection(db, 'users'));
            const chunks = [];
            let currentBatch = writeBatch(db);
            let count = 0;

            usersSnap.docs.forEach((doc) => {
                currentBatch.update(doc.ref, {
                    points: 0,
                    badges: [], // Wipe badges
                    // unlockedAchievements? Maybe keep legacy? User said "each team" and "achievements page kaman kol al plyers yat3amlha reset"
                    unlockedAchievements: []
                });
                count++;
                if (count >= 490) { // Safety margin below 500
                    chunks.push(currentBatch.commit());
                    currentBatch = writeBatch(db);
                    count = 0;
                }
            });
            if (count > 0) chunks.push(currentBatch.commit());

            await Promise.all(chunks);

            // 3. Send System Notification (Mocking it via a 'broadcasts' collection trigger or just creating a log everyone sees)
            // Or better: Create a "Global Announcement"
            await addDoc(collection(db, 'announcements'), {
                title: "Season Reset! 🔄",
                message: "The Great Flood has receded. A new season begins now!",
                type: "system",
                createdAt: serverTimestamp(),
                active: true
            });

            await logAction('SEASON_RESET', { affectedUsers: usersSnap.size });
            alert("✅ SEASON RESET COMPLETE. All scores are zero.");

        } catch (error) {
            console.error("SEASON RESET FAILED:", error);
            alert("CRITICAL ERROR during reset. Check console.");
        } finally {
            setLoading(false);
        }
    };

    // 4. RESET ALL TEAM CHATS
    const resetAllChats = async () => {
        const confirmPhrase = "RESET ALL CHATS";
        const input = prompt(`⚠️ WARNING: IRREVERSIBLE ACTION ⚠️\n\nThis will permanently delete ALL messages (text, images, voice notes) from ALL team chats.\n\nType "${confirmPhrase}" to confirm:`);

        if (input !== confirmPhrase) {
            alert("Reset Cancelled.");
            return;
        }

        setLoading(true);
        try {
            const teamsSnap = await getDocs(collection(db, 'teams'));
            const deletePromises = teamsSnap.docs.map(async (teamDoc) => {
                const messagesColl = collection(db, `teams/${teamDoc.id}/messages`);
                const messagesSnap = await getDocs(messagesColl);

                if (messagesSnap.empty) return;

                const chunks = [];
                let currentBatch = writeBatch(db);
                let count = 0;

                messagesSnap.docs.forEach((msgDoc) => {
                    currentBatch.delete(msgDoc.ref);
                    count++;
                    if (count >= 490) {
                        chunks.push(currentBatch.commit());
                        currentBatch = writeBatch(db);
                        count = 0;
                    }
                });

                if (count > 0) chunks.push(currentBatch.commit());
                await Promise.all(chunks);

                // Send a system message to indicate reset
                await addDoc(messagesColl, {
                    text: "تم إعادة ضبط الشات. كل الرسائل السابقة تم مسحها.",
                    uid: "SYSTEM",
                    name: "System",
                    type: "text",
                    createdAt: serverTimestamp()
                });
            });

            await Promise.all(deletePromises);
            await logAction('GLOBAL_CHAT_RESET', { affectedTeams: teamsSnap.size });
            alert("✅ ALL CHATS RESET COMPLETE.");
        } catch (error) {
            console.error("GLOBAL CHAT RESET FAILED:", error);
            alert("Critical error during chat reset. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return {
        updateTeamScore,
        resetTeam,
        resetSeason,
        resetAllChats,
        loading
    };
}
