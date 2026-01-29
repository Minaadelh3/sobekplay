
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

// 1. Load Env Vars FIRST (Blocking)
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
    console.log('✅ Loaded environment from .env.local');
} else {
    dotenv.config();
    console.log('⚠️ .env.local not found, using default .env');
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 2. Helper Logic
const createVercelHandler = (handler: any) => {
    return async (req: express.Request, res: express.Response) => {
        try {
            await handler(req, res);
        } catch (error) {
            console.error('API Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
};

// 3. Main Boot Function
async function startServer() {
    try {
        // DYNAMIC IMPORT: Ensures env vars are loaded BEFORE this file is read
        const chatModule = await import('../api/chat');
        const chatHandler = chatModule.default;

        app.post('/api/chat', createVercelHandler(chatHandler));

        app.listen(PORT, () => {
            console.log(`
  🚀 Local API Server running at http://localhost:${PORT}
  👉 Chat endpoint: http://localhost:${PORT}/api/chat
  🔑 Key Status: ${process.env.GROQ_API_KEY ? 'Loaded' : 'MISSING'}
            `);
        });

    } catch (err) {
        console.error("Failed to start local API:", err);
        process.exit(1);
    }
}

startServer();
