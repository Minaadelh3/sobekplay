
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, sendError, sendSuccess, verifyAdmin } from '../../lib/api-utils';
import { getDb } from '../../lib/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return sendError(res, 405, "Method Not Allowed");

    try {
        await verifyAdmin(req);

        const snapshot = await getDb().collection('push_history')
            .orderBy('sentAt', 'desc')
            .limit(50)
            .get();

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sentAt: doc.data().sentAt?.toDate?.(),
            scheduledFor: doc.data().scheduledFor ? new Date(doc.data().scheduledFor) : null
        }));

        return sendSuccess(res, history);

    } catch (error: any) {
        console.error("Push History Error:", error);
        return sendError(res, 500, error.message || "Internal Server Error");
    }
}
