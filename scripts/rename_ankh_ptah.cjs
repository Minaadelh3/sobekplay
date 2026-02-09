const admin = require('firebase-admin');

const path = require('path');
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

let hasCreds = false;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT) {
    hasCreds = true;
} else {
    try {
        const fs = require('fs');
        if (fs.existsSync(serviceAccountPath)) {
            process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
            hasCreds = true;
            console.log("🔑 Loaded credentials from service-account.json");
        }
    } catch (e) {
        console.warn("Could not check for service-account.json", e);
    }
}

if (!hasCreds) {
    console.error("❌ ERROR: No Credentials Found. Please retrieve service-account.json and place it in the project root.");
    process.exit(1);
}

// Check if initialized
if (admin.apps.length === 0) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } catch (e) {
        console.error("Initialization error:", e);
        process.exit(1);
    }
}

const db = admin.firestore();

async function renameAnkhToPtah() {
    console.log("🚀 Starting ANKH -> PTAH Migration (CJS)...");

    // 1. Get Old Team Data
    const oldTeamRef = db.collection('teams').doc('ankh');
    const oldTeamSnap = await oldTeamRef.get();

    if (!oldTeamSnap.exists) {
        console.log("⚠️ Team 'ankh' not found. Checking if 'ptah' exists...");
    } else {
        const oldData = oldTeamSnap.data();
        console.log("Found 'ankh' team data:", oldData);

        // 2. Create New Team
        const newTeamRef = db.collection('teams').doc('ptah');

        const newData = {
            ...oldData,
            id: 'ptah',
            name: 'بتاح',
            avatar: '/profile/ankh.png'
        };

        if (oldData.points) newData.points = oldData.points;
        if (oldData.xp) newData.xp = oldData.xp;

        await newTeamRef.set(newData);
        console.log("✅ Created 'ptah' team document.");
    }

    // 3. Migrate Users
    console.log("🔄 Migrating users...");
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('teamId', '==', 'ankh').get();

    if (querySnapshot.empty) {
        console.log("No users found in team 'ankh'.");
    } else {
        const batch = db.batch();
        let count = 0;

        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { teamId: 'ptah' });
            count++;
        });

        await batch.commit();
        console.log(`✅ Moved ${count} users from 'ankh' to 'ptah'.`);
    }

    // 4. Delete Old Team
    if (oldTeamSnap.exists) {
        await oldTeamRef.delete();
        console.log("🗑️ Deleted 'ankh' team document.");
    }

    console.log("🎉 Migration Complete!");
}

renameAnkhToPtah().catch(console.error);
