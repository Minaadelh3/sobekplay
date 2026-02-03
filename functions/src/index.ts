import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { canSendNotification, updateRuleState, NotificationType } from './rulesEngine';

admin.initializeApp();

const db = admin.firestore();

interface SendPushData {
    userIds?: string[];
    title: string;
    body: string;
    url?: string; // Deep link URL
    type: NotificationType;
    metadata?: any;
    dryRun?: boolean; // For testing rules without sending
}

/**
 * Cloud Function: Send Push Notification
 * Securely callable from Client (Admin Panel) or other Functions.
 */
export const sendPushNotification = functions.https.onCall(async (data: SendPushData, context: functions.https.CallableContext) => {
    // 1. Security Check: Ensure caller is Authenticated & Admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    // In strict mode, we might verify role here. 
    // For now, we allow any auth user to *try*, but we can enforce Admin-only logic if needed.
    // const callerRef = db.doc(`users/${context.auth.uid}`);
    // const callerSnap = await callerRef.get();
    // if (callerSnap.data()?.role !== 'ADMIN') throw ...

    const { userIds, title, body, url, type, metadata, dryRun } = data;

    if (!userIds || userIds.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'No users specified.');
    }

    const results = {
        success: 0,
        failed: 0,
        skipped: 0
    };

    // 2. Process each user
    for (const userId of userIds) {
        try {
            // A. Rule Check
            const allowed = await canSendNotification(userId, type);
            if (!allowed) {
                console.log(`Skipping notification for ${userId} due to rules.`);
                results.skipped++;
                continue;
            }

            if (dryRun) {
                results.success++;
                continue;
            }

            // B. Fetch Tokens
            const tokensSnap = await db.collection(`users/${userId}/fcmTokens`).get();
            if (tokensSnap.empty) {
                console.log(`No tokens found for user ${userId}`);
                results.failed++; // Technical failure (no token)
                continue;
            }

            // Collect tokens
            const tokens: string[] = [];
            tokensSnap.forEach((doc: any) => tokens.push(doc.id));

            // C. Send Payload
            // Construct message
            const message: admin.messaging.MulticastMessage = {
                tokens: tokens,
                notification: {
                    title,
                    body,
                },
                data: {
                    url: url || '/',
                    type: type,
                    click_action: url || '/'
                },
                android: {
                    priority: 'high',
                    notification: {
                        icon: 'stock_ticker_update',
                        clickAction: url || '/' // For better Android compat
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                }
            };

            const response = await admin.messaging().sendMulticast(message);

            // D. Handle Invalid Tokens (Cleanup)
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp: admin.messaging.SendResponse, idx: number) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });

                // Cleanup logic
                const batch = db.batch();
                failedTokens.forEach(t => {
                    batch.delete(db.doc(`users/${userId}/fcmTokens/${t}`));
                });
                await batch.commit();
                console.log(`Cleaned up ${failedTokens.length} invalid tokens for user ${userId}.`);
            }

            if (response.successCount > 0) {
                // E. Log & Update Rules
                await updateRuleState(userId, type, metadata);

                await db.collection('notificationsLog').add({
                    userId,
                    type,
                    title,
                    body,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: metadata || {},
                    senderId: context.auth.uid
                });

                results.success++;
            }

        } catch (error) {
            console.error(`Error processing user ${userId}`, error);
            results.failed++;
        }
    }

    return results;
});
