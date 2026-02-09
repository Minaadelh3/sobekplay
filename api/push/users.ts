
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, sendError, sendSuccess, verifyAdmin } from '../../lib/api-utils';
import { getDb } from '../../lib/firebaseAdmin';
import { OneSignalServer } from '../../lib/onesignal-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return sendError(res, 405, "Method Not Allowed");

    try {
        // 1. Fetch App Details (Segments, stats) from OneSignal
        // WRAPPED IN TRY/CATCH to prevent entire endpoint failure
        let appDetails = { players: 0, messageable_players: 0 };
        try {
            console.log("Fetching OneSignal App Details...");
            // Use a short timeout or just try
            appDetails = await OneSignalServer.getAppDetails();
        } catch (err: any) {
            console.error("⚠ OneSignal Stats Fetch Failed:", err.message);
        }

        // 2. Fetch Users from Firestore
        console.log("Fetching Firestore Users...");
        const usersSnapshot = await getDb().collection('users').get();
        console.log(`Found ${usersSnapshot.docs.length} users in Firestore.`);

        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            const hasExplicitDisable = data.notifications?.enabled === false;
            const isSubscribed = !hasExplicitDisable;

            return {
                id: doc.id,
                name: data.name || data.displayName || 'Unknown',
                teamId: data.teamId,
                role: data.role,
                avatar: data.avatar || data.photoURL,
                email: data.email,
                isSubscribed: isSubscribed
            };
        });

        return sendSuccess(res, {
            stats: {
                total_users: appDetails.players || 0,
                messageable_users: appDetails.messageable_players || 0,
            },
            segments: [
                { id: 'Subscribed Users', name: 'Subscribed Users' },
                { id: 'Active Users', name: 'Active Users' },
                { id: 'Inactive Users', name: 'Inactive Users' }
            ],
            users: users
        });

    } catch (error: any) {
        console.error("Push Users API Error:", error);
        return sendError(res, 500, error.message || "Internal Server Error");
    }
}
