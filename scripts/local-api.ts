
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to mimic Vercel Request/Response
const createVercelHandler = (handler: any) => {
    return async (req: express.Request, res: express.Response) => {
        try {
            // Vercel handlers expect (req, res) where req.body is already parsed
            await handler(req, res);
        } catch (error) {
            console.error('API Error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
};

// Dynamically import the chat handler
// Note: We're importing the source .ts file via tsx
import chatHandler from '../api/chat';

app.post('/api/chat', createVercelHandler(chatHandler));

app.listen(PORT, () => {
    console.log(`
  🚀 Local API Server running at http://localhost:${PORT}
  👉 Chat endpoint: http://localhost:${PORT}/api/chat
    `);
});
