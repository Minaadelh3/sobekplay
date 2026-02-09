
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file in root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
    console.error("❌ Missing Firebase Configuration. Check .env file.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function recalcTeamXP() {
    console.log("🚀 Starting Team XP Recalculation...");

    // 1. Fetch all users
    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`📊 Found ${usersSnap.size} users.`);

    // 2. Aggregate XP by Team
    const teamXP: Record<string, number> = {};

    usersSnap.forEach(doc => {
        const data = doc.data();
        const teamId = data.teamId;
        const xp = data.xp || data.points || 0; // Fallback to points if XP missing, but prefer XP

        if (teamId) {
            if (!teamXP[teamId]) teamXP[teamId] = 0;
            teamXP[teamId] += xp;
        }
    });

    console.log("∑ Calculated Team XP:", teamXP);

    // 3. Update Teams
    const batch = writeBatch(db);
    let updateCount = 0;

    for (const [teamId, xp] of Object.entries(teamXP)) {
        if (teamId === 'uncle_joy') continue; // Skip admin team if needed

        const teamRef = doc(db, "teams", teamId);
        // Update both fields for safety
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

recalcTeamXP();
