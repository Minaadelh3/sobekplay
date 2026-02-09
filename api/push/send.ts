
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, sendError, sendSuccess, verifyAdmin } from '../../lib/api-utils';
import { OneSignalServer } from '../../lib/onesignal-server';
import { getDb } from '../../lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return sendError(res, 405, "Method Not Allowed");

    try {
        const user = await verifyAdmin(req);
        const { title, message, url, imageUrl, audience, sendAfter } = req.body;

        if (!title || !message) {
            return sendError(res, 400, "Title and Message are required");
        }

        // Construct OneSignal Notification Object
        const notificationData: any = {
            contents: { en: message },
            headings: { en: title },
            url: url || undefined,
            big_picture: imageUrl || undefined,
            chrome_web_image: imageUrl || undefined,
        };

        // Audience Targeting Logic
        if (audience.type === 'All') {
            notificationData.included_segments = ['Subscribed Users'];
        } else if (audience.type === 'SpecificUsers' && audience.userIds?.length) {
            // We need to map internal User IDs to OneSignal Player IDs
            // For now, we assume we don't have this mapping perfectly sync'd in backend
            // So we might need to rely on 'include_external_user_ids' if we set that up
            // Or 'include_player_ids' if the frontend passes them

            // If frontend passes player_ids directly (best for now):
            if (audience.include_player_ids) {
                notificationData.include_player_ids = audience.include_player_ids;
            } else {
                // Fetch from Firestore users
                try {
                    const db = getDb();
                    const refs = audience.userIds.map((id: string) => db.collection('users').doc(id));
                    // Check if we can actually read
                    // Optimization: We can't easily check quota without trying.
                    const docs = await db.getAll(...refs);

                    const playerIds: string[] = [];
                    docs.forEach((doc: any) => {
                        const d = doc.data();
                        if (d?.oneSignalId) playerIds.push(d.oneSignalId);
                        // Also check tokens array if we have it
                        if (d?.notifications?.pushTokens) playerIds.push(...d.notifications.pushTokens);
                    });

                    if (playerIds.length === 0) {
                        return sendError(res, 400, "No valid push tokens found for selected users.");
                    }
                    notificationData.include_player_ids = [...new Set(playerIds)];
                } catch (e: any) {
                    // QUOTA FALLBACK
                    if (e.code === 8 || e.message?.includes('RESOURCE_EXHAUSTED')) {
                        console.warn("⚠️ Firestore Quota Exhausted during Audience Lookup.");
                        // Fallback: Use External IDs directly (OneSignal maps them via setExternalUserId)
                        // This assumes the frontend set external IDs to match Firebase UIDs.
                        notificationData.include_aliases = {
                            external_id: audience.userIds
                        };
                        notificationData.target_channel = "push";
                    } else {
                        throw e;
                    }
                }
            }
        }
        else if (audience.type === 'Test' && audience.include_player_ids) {
            notificationData.include_player_ids = audience.include_player_ids;
        }

        if (sendAfter) {
            notificationData.send_after = sendAfter;
        }

        // Send via OneSignal
        console.log("Sending Push:", JSON.stringify(notificationData, null, 2));
        const osResponse = await OneSignalServer.sendNotification(audience, notificationData);

        // Store in History (Best Effort)
        try {
            await getDb().collection('push_history').add({
                title,
                message,
                target: audience,
                stats: {
                    recipients: osResponse.recipients,
                    id: osResponse.id
                },
                sentBy: user.uid,
                sentAt: FieldValue.serverTimestamp(),
                status: sendAfter ? 'scheduled' : 'sent',
                scheduledFor: sendAfter || null
            });
        } catch (histErr: any) {
            console.warn("⚠️ Failed to log push history (Non-Critical):", histErr.message);
        }

        return sendSuccess(res, {
            id: osResponse.id,
            recipients: osResponse.recipients
        });

    } catch (error: any) {
        console.error("Push Send Error:", error);
        return sendError(res, 500, error.message || "Internal Server Error");
    }
}
