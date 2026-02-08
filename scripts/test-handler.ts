
import handler from '../api/send-notification';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

console.log(`Loading env from ${envPath}`);
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

// Emulate local-api.ts credential logic
if (fs.existsSync(serviceAccountPath)) {
    console.log(`✅ Found service-account.json at ${serviceAccountPath}`);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
} else {
    console.log("⚠️ service-account.json NOT found.");
}

console.log("Testing Notification Handler with Credentials...");
if (process.env.ONESIGNAL_REST_API_KEY) console.log("✅ ONESIGNAL_REST_API_KEY found");
else console.log("❌ ONESIGNAL_REST_API_KEY MISSING");

const req = {
    method: 'POST',
    body: {
        title: 'Test Notification',
        message: 'This is a test message',
        targetType: 'ALL',
        metadata: { source: 'test-script' }
    }
} as any;

const res = {
    setHeader: (k: string, v: string) => { },
    status: (code: number) => {
        console.log(`Response Status: ${code}`);
        return res;
    },
    json: (data: any) => {
        console.log("Response JSON:", JSON.stringify(data, null, 2));
        return res;
    },
    end: () => console.log("Response End")
} as any;

handler(req, res).then(() => {
    console.log("Handler execution finished.");
}).catch((e: any) => {
    console.error("Handler threw exception:", e);
});
