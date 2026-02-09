import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

console.log(`Loading env from ${envPath}`);
dotenv.config({ path: envPath });

if (fs.existsSync(serviceAccountPath)) {
    console.log(`Found service-account.json at ${serviceAccountPath}`);
    // Read and set as env var for lib/firebaseAdmin.ts
    const serviceAccount = fs.readFileSync(serviceAccountPath, 'utf8');
    process.env.FIREBASE_SERVICE_ACCOUNT = serviceAccount;
}

import { getDb } from '../lib/firebaseAdmin';

async function checkPushHistory() {
    try {
        console.log("Initializing Firestore...");
        const db = getDb();

        console.log("Checking push_history count...");
        const snapshot = await db.collection('push_history').count().get();
        console.log(`Total push_history documents: ${snapshot.data().count}`);

        console.log("Attempting to write to push_history...");
        const res = await db.collection('push_history').add({
            test: true,
            timestamp: new Date(),
            note: "Debug script write test"
        });
        console.log(`Successfully wrote to push_history. Doc ID: ${res.id}`);

        // Clean up
        await res.delete();
        console.log("Successfully deleted test document.");

    } catch (e: any) {
        console.error("Error during Firestore check:", e);
        if (e.code === 8 || e.message.includes('RESOURCE_EXHAUSTED')) {
            console.error("!!! RESOURCE EXHAUSTED CONFIRMED !!!");
            console.error("This means the Firebase project has exceeded its quota (e.g. daily writes/reads or storage).");
        }
    }
}

checkPushHistory();
