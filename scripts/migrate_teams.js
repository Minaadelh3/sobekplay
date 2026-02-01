/**
 * MIGRATION SCRIPT: Initialize Team Points
 * 
 * 1. Iterates all teams.
 * 2. Adds { isScorable: true, points: 0 } if missing.
 * 3. Forces { isScorable: false, points: 0 } for "Uncle Joy".
 * 
 * Usage: node scripts/migrate_teams.js
 */

const admin = require('firebase-admin');

// --- CONFIG ---
// User must provide their service account path or credentials
// For safety, we will assume standard initializing if already in cloud env,
// or require explicit key path.
// PLACEHOLDER: Ensure you have GOOGLE_APPLICATION_CREDENTIALS set or pass serviceAccount.
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("❌ ERROR: No Credentials Found. Set GOOGLE_APPLICATION_CREDENTIALS or run within Firebase context.");
    console.log("👉 Tip: Download service-account.json from Firebase Console > Project Settings > Service Accounts");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function migrateTeams() {
    console.log("🚀 Starting Team Points Migration...");

    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.get();

    if (snapshot.empty) {
        console.log("⚠️ No teams found in Firestore.");
        return;
    }

    let updatedCount = 0;
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const teamId = doc.id;
        const name = data.name || "";

        let updates = {};

        // CHECK 1: Identify "Uncle Joy"
        const isUncleJoy = name.trim() === "Uncle Joy" || teamId === "uncle_joy";

        if (isUncleJoy) {
            console.log(`🔒 Locking Team: ${name} (${teamId})`);
            updates.isScorable = false;
            updates.points = 0; // Reset or keep 0
        } else {
            // CHECK 2: Standard Teams
            if (data.isScorable === undefined) {
                updates.isScorable = true;
            }
            if (data.points === undefined) {
                updates.points = 0;
            }
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
            updatedCount++;
            console.log(`📝 Queued update for: ${name} -> ${JSON.stringify(updates)}`);
        }
    });

    if (updatedCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully updated ${updatedCount} teams.`);
    } else {
        console.log("✅ All teams are already up to date.");
    }
}

migrateTeams().catch(console.error);
