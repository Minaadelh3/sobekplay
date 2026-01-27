/// <reference types="vite/client" />
// services/gameAI.ts

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// --- STRICT TYPES ---
export type GameMode = 'PASS_BOOM' | 'TRUTH_DARE' | 'EMOJI_MOVIES' | 'PROVERBS' | 'STORY_CHAIN';
export type GameType = 'QUESTION' | 'TASK' | 'EMOJI' | 'PROVERB' | 'STARTER' | 'PENALTY';

export interface GameCard {
    id: string; // Unique ID for debug/key
    game: GameMode;
    type: GameType;
    text: string;
    emoji?: string | null;
    answer?: string | null;
    minTimeRequired: number;
    maxTimeAllowed: number;
    safe: boolean;
    debug?: {
        model: string;
        latency: number;
        promptTokens: number;
        timestamp: string;
    };
}

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
YOU ARE A HUMAN PARTY HOST — NOT A MACHINE (EGYPTIAN ARABIC)

ROLE:
You are a smart, funny Egyptian friend hosting a game night. 
Keep the vibe warm, social, and "Ibn Balad".
Language: Egyptian Arabic (Masry) ONLY.

INPUT CONTEXT:
- Game Mode
- Category
- Timer (Seconds)
- Intensity (Low/Medium/High)
- History (Avoid repetition)

LOGIC RULES (CRITICAL):
1. **Timer Check**: If timer <= 10s, output MUST be an instant verbal question. NO acting, NO drawing, NO storytelling.
2. **Safety**: "Spicy" is allowed (cheeky/bold) but NO explicit, NO sexual, NO hate, NO political.
3. **Emoji Movies**: Emojis must spell the title phonetically or conceptually. Answer = Exact Title.
4. **Proverbs**: Output first half only. Answer = Exact completion.

OUTPUT FORMAT (JSON ONLY):
{
  "game": "string",
  "type": "string",
  "text": "Masry string",
  "emoji": "string | null",
  "answer": "string | null",
  "minTimeRequired": number, 
  "maxTimeAllowed": number,
  "safe": boolean
}
`;

// --- GENERATOR ---
export async function generateGameCard(
    gameMode: GameMode,
    category: string,
    timerSeconds: number,
    intensity: string,
    history: string[]
): Promise<GameCard | null> {

    if (!API_KEY) {
        console.error("GameAI: No API Key found.");
        throw new Error("API Key Missing");
    }

    const startTime = Date.now();
    const userPrompt = `
    MODE: ${gameMode}
    CATEGORY: ${category}
    TIMER: ${timerSeconds}s
    INTENSITY: ${intensity}
    HISTORY: [${history.slice(-10).join(', ')}]
    
    GENERATE 1 NEW CARD.
  `;

    // Retry Loop (Max 5)
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n" + userPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);

            const data = await response.json();
            const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!jsonText) throw new Error("Empty AI Response");

            const rawCard = JSON.parse(jsonText);
            const latency = Date.now() - startTime;

            // --- VALIDATION ---
            if (!rawCard.safe) throw new Error("Unsafe content detected");
            if (rawCard.minTimeRequired > timerSeconds && timerSeconds > 0) throw new Error("Task too long for timer");
            if (history.includes(rawCard.text)) throw new Error("Duplicate content");

            // Valid Card
            return {
                id: crypto.randomUUID(),
                game: gameMode,
                type: rawCard.type,
                text: rawCard.text,
                emoji: rawCard.emoji || null,
                answer: rawCard.answer || null,
                minTimeRequired: rawCard.minTimeRequired || 5,
                maxTimeAllowed: rawCard.maxTimeAllowed || 60,
                safe: true,
                debug: {
                    model: 'gemini-2.0-flash',
                    latency,
                    promptTokens: userPrompt.length,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (err) {
            console.warn(`AI Retry ${i + 1}/5:`, err);
            if (i === 4) return null; // Let UI handle failure after 5 tries
        }
    }
    return null;
}
