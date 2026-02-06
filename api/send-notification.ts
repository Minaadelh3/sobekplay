import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/firebaseAdmin';
import * as admin from 'firebase-admin';

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

    if (!API_KEY || !APP_ID) {
        console.error("Missing OneSignal Config", { API_KEY: !!API_KEY, APP_ID: !!APP_ID });
        return res.status(500).json({ error: 'Server Misconfiguration' });
    }

    try {
        const { title, message, targetType, externalUserId, include_external_user_ids, metadata } = req.body;

        // 4. Validation
        if (!title || !message) {
            return res.status(400).json({ error: 'Missing title or message' });
        }

        // 5. Construct Payload for OneSignal
        const oneSignalPayload: any = {
            app_id: APP_ID,
            headings: { en: title },
            contents: { en: message },
            priority: 10,
            data: metadata || {}
        };

        let targetIds: string[] = [];

        // Target Logic
        if (targetType === 'SPECIFIC_USER') {
            targetIds = include_external_user_ids || (externalUserId ? [externalUserId] : []);

            if (!targetIds || targetIds.length === 0) {
                return res.status(400).json({ error: 'Missing Target User IDs' });
            }
            oneSignalPayload.include_external_user_ids = targetIds;
        } else if (targetType === 'SEGMENT') {
            oneSignalPayload.included_segments = ["Subscribed Users"];
        } else {
            // Default: ALL (Active Users)
            oneSignalPayload.included_segments = ["Subscribed Users"];
        }

        // 6. PERSISTENCE FIRST (Source of Truth)
        // We create the document in Firestore first.
        const notificationDoc = {
            title,
            message,
            targetType: targetType || 'ALL',
            // If SPECIFIC_USER, store array of IDs. If null/undefined, it's global/segment.
            targetIds: targetType === 'SPECIFIC_USER' ? targetIds : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: metadata || {},
            sentViaOneSignal: false, // Default false, updated after send
            oneSignalId: null
        };

        console.log("💾 Saving notification to Firestore...");
        const docRef = await db.collection('notifications').add(notificationDoc);
        console.log(`✅ Notification saved with ID: ${docRef.id}`);

        // 7. Send to OneSignal
        console.log("🚀 Sending to OneSignal...");
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(oneSignalPayload)
        });

        const data = await response.json();

        // 8. Update Firestore with Send Status
        if (response.ok) {
            await docRef.update({
                sentViaOneSignal: true,
                oneSignalId: data.id,
                recipientsCount: data.recipients
            });
            console.log(`✅ OneSignal Sent: ${data.id}`);
            return res.status(200).json({ success: true, id: data.id, firestoreId: docRef.id });
        } else {
            console.error("❌ OneSignal Error:", data);
            // We do NOT delete the Firestore doc, because the alert ensures it appears locally.
            // But we might want to flag it as failed delivery.
            await docRef.update({
                sentViaOneSignal: false,
                oneSignalError: data.errors?.[0] || 'Unknown Error'
            });
            return res.status(response.status).json({ error: data.errors?.[0] || 'OneSignal API Error', firestoreId: docRef.id });
        }

    } catch (error: any) {
        console.error("Send Notification Error:", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
