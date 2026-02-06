import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS Headers (Security)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production to your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 3. Environment Variables Check
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;
    const APP_ID = process.env.ONESIGNAL_APP_ID;

    console.log("DEBUG API: Checking Keys");
    console.log("APP_ID:", APP_ID ? "Found" : "Missing");
    console.log("API_KEY:", API_KEY ? "Found" : "Missing");

    if (!API_KEY || !APP_ID) {
        console.error("Missing OneSignal Config", { API_KEY: !!API_KEY, APP_ID: !!APP_ID });
        return res.status(500).json({ error: 'Server Misconfiguration' });
    }

    try {
        const { title, message, targetType, externalUserId, include_external_user_ids } = req.body;

        // 4. Validation
        if (!title || !message) {
            return res.status(400).json({ error: 'Missing title or message' });
        }

        // 5. Construct Payload
        const payload: any = {
            app_id: APP_ID,
            headings: { en: title },
            contents: { en: message },
            priority: 10,
        };

        // Target Logic
        if (targetType === 'SPECIFIC_USER') {
            const targets = include_external_user_ids || (externalUserId ? [externalUserId] : []);

            if (!targets || targets.length === 0) {
                return res.status(400).json({ error: 'Missing Target User IDs' });
            }
            payload.include_external_user_ids = targets;
        } else if (targetType === 'SEGMENT') {
        } else if (targetType === 'SEGMENT') {
            // Default to "Subscribed Users" or specific segment
            payload.included_segments = ["Subscribed Users"];
        } else {
            // Default: ALL (Active Users)
            payload.included_segments = ["Subscribed Users"];
        }

        // 6. Send to OneSignal
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OneSignal Error:", data);
            return res.status(response.status).json({ error: data.errors?.[0] || 'OneSignal API Error' });
        }

        // 7. Success
        return res.status(200).json({ success: true, id: data.id, recipients: data.recipients });

    } catch (error: any) {
        console.error("Send Notification Error:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
