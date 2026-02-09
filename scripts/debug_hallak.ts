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

async function debug() {
    console.log("🔍 Listing ALL Users...");

    const userSnap = await db.collection("users").get();
    userSnap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`👤 [${doc.id}] Name: "${d.name}" | Email: "${d.email}" | Team: "${d.teamId}" | XP: ${d.xp} | Points: ${d.points}`);
    });
}

debug();
