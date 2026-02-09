
import admin from 'firebase-admin';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../service-account.json');

if (!admin.apps?.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function syncPoints() {
    console.log("🔄 Starting Points <-> XP Sync...");

    const usersSnap = await db.collection('users').get();
    let updatedCount = 0;

    const batchSize = 500;
    let batch = db.batch();
    let opCount = 0;

    for (const doc of usersSnap.docs) {
        const data = doc.data();
        const xp = data.xp || 0;
        const points = data.points || 0;

        // Rule: XP is usually the source of truth for "Total Score". 
        // We will set Points = XP to ensure they are the same as per user request.
        if (points !== xp) {
            batch.update(doc.ref, { points: xp });
            opCount++;
            updatedCount++;

            console.log(`Mismatch User ${doc.id}: XP ${xp} vs Points ${points} -> Synced to ${xp}`);
        }

        if (opCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            opCount = 0;
        }
    }

    if (opCount > 0) {
        await batch.commit();
    }

    console.log(`✅ Sync Complete. Updated ${updatedCount} users.`);
}

syncPoints().catch(console.error);
