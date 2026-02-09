
import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Admin SDK
const serviceAccount = require('../service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function backfill() {
    console.log("🚀 Starting Backfill Process...");

    const usersSnap = await db.collection('users').get();
    console.log(`Found ${usersSnap.size} users.`);

    let dispatched = 0;

    for (const doc of usersSnap.docs) {
        const user = doc.data();
        const userId = doc.id;
        const events: any[] = [];

        // 1. First Login / Created
        events.push({
            name: 'USER_CREATED',
            userId: userId,
            timestamp: user.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            metadata: { backfill: true }
        });

        // 2. Profile Photo
        if (user.photoURL || user.avatarUrl) {
            events.push({
                name: 'PROFILE_PICTURE_UPLOADED',
                userId: userId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: { backfill: true }
            });
        }

        // 3. Team Joined
        if (user.teamId) {
            events.push({
                name: 'TEAM_JOINED',
                userId: userId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: { backfill: true, teamId: user.teamId }
            });
        }

        // 4. Onboarding Complete (Assume if teamId is set or older user)
        if (user.isOnboarded || user.teamId) {
            events.push({
                name: 'ONBOARDING_COMPLETED',
                userId: userId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: { backfill: true }
            });
        }

        // 5. Notifications Enabled
        if (user.notifications?.push) {
            events.push({
                name: 'NOTIFICATIONS_ENABLED',
                userId: userId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: { backfill: true }
            });
        }

        // Batch write events
        const batch = db.batch();
        for (const event of events) {
            const ref = db.collection('events').doc();
            batch.set(ref, event);
        }

        await batch.commit();
        dispatched += events.length;
        console.log(`Processed User ${userId}: Dispatched ${events.length} events.`);
    }

    console.log(`✅ Backfill Complete. Dispatched ${dispatched} events for processing.`);
}

backfill().catch(console.error);
