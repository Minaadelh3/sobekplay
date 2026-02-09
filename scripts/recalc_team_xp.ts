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

async function recalcTeamXP() {
    console.log("🚀 Starting Team XP Recalculation (Admin SDK)...");

    // 1. Fetch all users
    const usersSnap = await db.collection("users").get();
    console.log(`📊 Found ${usersSnap.size} users.`);

    // 2. Aggregate XP by Team
    const teamXP: Record<string, number> = {};

    usersSnap.forEach(doc => {
        const data = doc.data();
        const teamId = data.teamId;
        // Use the exact same logic as the sync script: XP is truth
        const xp = data.xp || 0;

        if (teamId) {
            if (!teamXP[teamId]) teamXP[teamId] = 0;
            teamXP[teamId] += xp;
        }
    });

    console.log("∑ Calculated Team XP:", teamXP);

    // 3. Update Teams
    const batch = db.batch();
    let updateCount = 0;

    for (const [teamId, xp] of Object.entries(teamXP)) {
        // REMOVED: if (teamId === 'uncle_joy') continue; 

        const teamRef = db.collection("teams").doc(teamId);

        // Sync everything: xp, points, totalPoints
        batch.update(teamRef, {
            xp: xp,
            points: xp,
            totalPoints: xp
        });

        updateCount++;
        console.log(`📝 Queueing update for Team ${teamId}: ${xp} XP`);
    }

    if (updateCount > 0) {
        try {
            await batch.commit();
            console.log("✅ Successfully updated all teams!");
        } catch (e) {
            console.error("❌ Error committing batch update:", e);
        }
    } else {
        console.log("ℹ️ No teams to update.");
    }
}

recalcTeamXP().catch(console.error);
