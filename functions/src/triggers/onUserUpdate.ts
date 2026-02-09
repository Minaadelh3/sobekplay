import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Trigger: onUserUpdate
 * Watches for changes to 'users/{userId}' document.
 * If 'xp' changes, it propagates the delta to the user's Team.
 */
export const onUserUpdate = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        // 1. Check if XP Changed
        const newXP = newData.xp || 0;
        const oldXP = oldData.xp || 0;

        if (newXP === oldXP) return null; // No change in XP

        const delta = newXP - oldXP;
        const teamId = newData.teamId;

        if (!teamId) return null; // User has no team

        console.log(`🔄 User ${context.params.userId} XP changed: ${oldXP} -> ${newXP} (Delta: ${delta}). Syncing to Team ${teamId}...`);

        const teamRef = db.collection('teams').doc(teamId);

        try {
            await db.runTransaction(async (t) => {
                const teamSnap = await t.get(teamRef);
                if (!teamSnap.exists) return; // Team doesn't exist?

                // Increment all related fields to stay consistent
                t.update(teamRef, {
                    xp: admin.firestore.FieldValue.increment(delta),
                    points: admin.firestore.FieldValue.increment(delta),
                    totalPoints: admin.firestore.FieldValue.increment(delta),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
            console.log(`✅ Team ${teamId} updated successfully.`);
        } catch (error) {
            console.error(`❌ Failed to sync XP to Team ${teamId}:`, error);
        }

        return null;
    });
