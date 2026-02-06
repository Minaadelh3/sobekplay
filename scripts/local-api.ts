import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root .env and .env.local
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

console.log("Local API: Loaded Environment Variables");
console.log("- ONESIGNAL_APP_ID:", process.env.ONESIGNAL_APP_ID ? "Found" : "MISSING");
console.log("- ONESIGNAL_REST_API_KEY:", process.env.ONESIGNAL_REST_API_KEY ? "Found" : "MISSING (Required for Push)");

// Import the handler
// Note: We use the relative path from THIS file (scripts/local-api.ts) to the api file
import sendNotification from '../api/send-notification';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Wrapper to adapt Vercel function signature to Express
const handleVercel = (handler: any) => async (req: any, res: any) => {
    // Vercel/NextRequest vs Express Request. 
    // Usually req.body, req.query, req.method are enough compatible.
    // handler(req, res)
    try {
        await handler(req, res);
    } catch (e: any) {
        console.error("API Handler Error:", e);
        if (!res.headersSent) {
            res.status(500).json({ error: e.message });
        }
    }
};

app.post('/api/send-notification', handleVercel(sendNotification));

app.listen(PORT, () => {
    console.log(`
    🚀 Local API Server running at http://localhost:${PORT}
    proxied by Vite (port 3000) -> /api -> http://localhost:${PORT}/api
    
    Test with:
    curl -X POST http://localhost:3000/api/send-notification -H "Content-Type: application/json" -d '{"title":"Test","message":"Hello"}'
    `);
});
