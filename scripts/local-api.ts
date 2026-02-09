
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
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

console.log(`Local API: Loading env from ${envPath}`);
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

console.log("Local API: Loaded Environment Variables");
console.log("- ONESIGNAL_APP_ID:", process.env.ONESIGNAL_APP_ID ? "Found" : "MISSING");
console.log("- ONESIGNAL_REST_API_KEY:", process.env.ONESIGNAL_REST_API_KEY ? "Found" : "MISSING (Required for Push)");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Found" : "MISSING");
console.log("- GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Found" : "MISSING");
console.log("- FIREBASE_SERVICE_ACCOUNT:", process.env.FIREBASE_SERVICE_ACCOUNT ? `Found (Length: ${process.env.FIREBASE_SERVICE_ACCOUNT.length})` : "MISSING");

// Robust Credential Loading Strategy
import fs from 'fs';
if (fs.existsSync(serviceAccountPath)) {
    console.log(`✅ Found service-account.json at ${serviceAccountPath}`);
    // Set this so Firebase Admin SDK picks it up automatically
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Existing logic for env var...
    try {
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("✅ FIREBASE_SERVICE_ACCOUNT is valid JSON");
    } catch (e: any) {
        console.error("❌ FIREBASE_SERVICE_ACCOUNT is NOT valid JSON:", e.message);
    }
} else {
    console.error("❌ CRITICAL: No credentials found (checked .env and service-account.json).");
}


// Import handlers
import chatHandler from '../api/chat';
import pushUsersHandler from '../api/push/users';
import pushSendHandler from '../api/push/send';
import pushScheduleHandler from '../api/push/schedule';
import pushHistoryHandler from '../api/push/history';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2).substring(0, 500)); // Log first 500 chars
    }
    next();
});

// Wrapper to adapt Vercel function signature to Express
const handleVercel = (handler: any) => async (req: any, res: any) => {
    // Mock Vercel Request/Response if needed, but Express req/res are usually compatible enough
    // We might need to handle specific Vercel helper properties if used
    try {
        await handler(req, res);
    } catch (e: any) {
        console.error("API Handler Error:", e);
        if (!res.headersSent) {
            res.status(500).json({ error: e.message || "Unknown API Error" });
        }
    }
};

// Routes
app.post('/api/chat', handleVercel(chatHandler));
// Push Routes
app.get('/api/push/users', handleVercel(pushUsersHandler));
app.post('/api/push/send', handleVercel(pushSendHandler));
app.post('/api/push/schedule', handleVercel(pushScheduleHandler));
app.get('/api/push/history', handleVercel(pushHistoryHandler));

// Health Check

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', time: new Date().toISOString() });
});

// 404 Handler (Force JSON)
app.use((req, res) => {
    res.status(404).json({ error: "Not Found", path: req.path });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Server Error:", err);
    if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Local API Server running at http://localhost:${PORT}
    proxied by Vite (port 3000) -> /api/* -> http://localhost:${PORT}/api/*
    
    Test Chat:
    curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message":"Hello"}'
    
    Test Push:
    curl -X POST http://localhost:3000/api/push/send -H "Content-Type: application/json" -d '{"title":"Test","message":"Hello", "audience": {"type": "All"}}'
    `);
});
