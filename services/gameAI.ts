/// <reference types="vite/client" />
// services/gameAI.ts
import { DATA_FALLBACK } from '../data/partyGames';

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// --- STRICT TYPES (User Defined) ---
export type GameMode = 'PASS_BOOM' | 'TRUTH_DARE' | 'EMOJI_MOVIES' | 'PROVERBS' | 'STORY_CHAIN';
export type GameType = 'QUESTION' | 'TASK' | 'EMOJI' | 'PROVERB' | 'STARTER' | 'PENALTY';

export interface GameCard {
    game: GameMode; // e.g., 'PASS_BOOM'
    type: GameType;
    text: string;
    emoji?: string | null;
    answer?: string | null;
    minTimeRequired: number;
    maxTimeAllowed: number;
    safe: boolean;
}

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
YOU ARE A HUMAN PARTY HOST — NOT A MACHINE

ROLE:
You are not an AI assistant.
You are a smart, funny Egyptian friend sitting in the middle of a night hangout.
Your job is to keep the vibe alive, the laughs flowing,
and the game LOGICAL, FAIR, and FUN.

GOAL:
Generate party card games content that feels:
- Human
- Social
- Spontaneous
- Egyptian (Masry)
- Smart, not cringe

--------------------------------
PERSONALITY (VERY IMPORTANT)
--------------------------------
- Talk like a real Egyptian friend.
- Warm, playful, witty.
- Never robotic.
- Never repetitive.
- Never over-explain.
- If something feels awkward, avoid it.

--------------------------------
GAME INTELLIGENCE (CRITICAL)
--------------------------------
Before generating ANY card, think:
1. Are people sitting together?
2. Is this doable in the given time?
3. Would this make the group laugh or interact?
4. Would I personally enjoy this card if I was playing?

If the answer is NO -> regenerate.

--------------------------------
STRICT AI OUTPUT FORMAT (JSON ONLY)
--------------------------------
Return ONLY one card at a time in valid JSON.
Format MUST be:

{
  "game": "string (PASS_BOOM | TRUTH_DARE | EMOJI_MOVIES | PROVERBS | STORY_CHAIN)",
  "type": "QUESTION | TASK | EMOJI | PROVERB | STARTER | PENALTY",
  "text": "Masry card text",
  "emoji": "string or null (only for EMOJI_MOVIES)",
  "answer": "string or null (exact answer for PROVERBS/EMOJI)",
  "minTimeRequired": number,
  "maxTimeAllowed": number,
  "safe": true
}

--------------------------------
LOGIC RULES
--------------------------------
- If timer <= 10 seconds:
  ONLY instant verbal questions.
- No acting tasks in speed rounds.
- No long storytelling unless explicitly allowed.
- One card = one simple action or question.

--------------------------------
EMOJI MOVIES RULE (STRICT)
--------------------------------
- Emojis must represent the MOVIE TITLE WORDS.
- NOT the plot.
- If the title cannot be clearly represented, choose another movie.
- Always provide the exact movie title as the answer.

--------------------------------
PROVERBS RULE
--------------------------------
- Show only the first half in "text".
- Always know the exact completion in "answer".
- Keep it Egyptian and common.

--------------------------------
STORY CHAIN RULE
--------------------------------
- "text" is the starter phrase.
- Must be open-ended and exciting.
`;

// --- MAIN GENERATOR FUNCTION ---
export async function generateGameCard(
    gameMode: string,
    category: string,
    timerSeconds: number,
    difficulty: string,
    history: string[]
): Promise<GameCard | null> {

    // 1. Check API Key
    if (!API_KEY) {
        console.warn("NO API KEY: Falling back to local deck (Last Resort).");
        return getFallbackCard(gameMode);
    }

    const userPrompt = `
    GAME_MODE: ${gameMode}
    CATEGORY: ${category}
    TIMER: ${timerSeconds} seconds
    DIFFICULTY: ${difficulty}
    HISTORY_TO_AVOID_REPEATING: [${history.slice(-20).join(', ')}]
    
    Generate 1 NEW card now.
  `;

    // 2. Retry Loop (Max 5)
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: SYSTEM_PROMPT + "\n" + userPrompt }]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) throw new Error(`API Status: ${response.status}`);

            const data = await response.json();
            const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!jsonText) throw new Error("Empty Response");

            const card: GameCard = JSON.parse(jsonText);

            // --- VALIDATION ---
            if (!card.safe) throw new Error("Unsafe content");
            if (card.minTimeRequired > timerSeconds && timerSeconds > 0) throw new Error("Task too long");
            if (gameMode === 'PASS_BOOM' && timerSeconds <= 10 && card.type === 'TASK' && card.minTimeRequired > 5) {
                throw new Error("Complex task in speed round");
            }

            // Success!
            return card;

        } catch (err) {
            console.warn(`Attempt ${i + 1} failed:`, err);
            // Wait slightly before retry to be nice to API (optional but good practice)
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // 3. Fallback (Last Resort)
    console.error("All AI attempts failed. Using fallback.");
    return getFallbackCard(gameMode);
}

// --- FALLBACK SYSTEM (LAST RESORT) ---
function getFallbackCard(gameMode: string): GameCard {
    // Map existing fallback data to new schema
    const list = DATA_FALLBACK[gameMode] || [];
    if (list.length === 0) return {
        game: gameMode as GameMode,
        type: 'QUESTION',
        text: 'System Error: No cards available.',
        minTimeRequired: 0,
        maxTimeAllowed: 60,
        safe: true
    };

    const random: any = list[Math.floor(Math.random() * list.length)];

    // Adapt old schema to new strict schema
    return {
        game: gameMode as GameMode,
        type: random.type, // Assumes type names match roughly or are compatible
        text: random.text,
        emoji: random.emoji || null,
        answer: random.answers ? random.answers[0] : (random.movieTitle || null),
        minTimeRequired: 5,
        maxTimeAllowed: 60,
        safe: true
    };
}
