
// services/gameAI.ts
import { DATA_FALLBACK } from '../data/partyGames';

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''; // Vite env variable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Define Strict Types
export type GameMode = 'PASS_BOOM' | 'TRUTH_DARE' | 'EMOJI_MOVIES' | 'PROVERBS' | 'STORY_CHAIN';
export type CardType = 'QUESTION' | 'CHALLENGE' | 'EMOJI' | 'PROVERB' | 'STARTER' | 'PENALTY';

export interface GameCard {
    mode: GameMode;
    type: CardType;
    category?: string;
    text: string;
    answers?: string[];
    emoji?: string;
    movieTitle?: string;
    minTimeRequired?: number;
    maxTimeRequired?: number;
    intensity?: number;
    safe?: boolean;
}

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are a Party Card Game Generator for adults (SAFE).
Language: Egyptian Arabic (Masry).
Return STRICT JSON ONLY. No extra text.

SAFETY:
- No explicit sexual content, no sexual acts.
- No nudity, no minors, no humiliation.
- No hate, no harassment, no illegal acts.
- Spicy = playful teasing, bold but respectful.

You will receive:
mode, category, timerSeconds, difficulty, recentHistory

HARD RULE:
All outputs MUST be logically playable within timerSeconds.
Set minTimeRequired/maxTimeRequired accordingly.
If timerSeconds <= 10: only instant verbal questions (no acting, no long tasks).

For PROVERBS:
Return:
type="PROVERB"
text="first half only"
answers=["exact completion"]

For EMOJI_MOVIES:
Emojis MUST represent the exact movie title words (NOT the plot).
Return:
type="EMOJI"
emoji="..."
movieTitle="Exact movie title"
text="Guess the movie title"
answers=["Exact title"]

Return JSON format:
{
  "mode": "...",
  "type": "...",
  "category": "...",
  "text": "...",
  "answers": ["..."],
  "emoji": "...",
  "movieTitle": "...",
  "minTimeRequired": number,
  "maxTimeRequired": number,
  "intensity": 1-5,
  "safe": true
}
`;

// --- MAIN GENERATOR FUNCTION ---
export async function generateGameCard(
    mode: GameMode,
    category: string,
    timerSeconds: number,
    difficulty: string,
    history: string[]
): Promise<GameCard | null> {

    if (!API_KEY) {
        console.warn("Missing Gemini API Key. Using fallback.");
        return getFallbackCard(mode, category);
    }

    const userPrompt = `
    MODE: ${mode}
    CATEGORY: ${category}
    TIMER: ${timerSeconds}s
    DIFFICULTY: ${difficulty}
    HISTORY_TO_AVOID: [${history.join(', ')}]
    
    Generate 1 card now.
  `;

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

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) throw new Error("Empty AI Response");

        const card: GameCard = JSON.parse(jsonText);

        // --- VALIDATION ---
        if (!card.safe) throw new Error("Unsafe content generated");
        if (card.minTimeRequired && card.minTimeRequired > timerSeconds) throw new Error("Task too long for timer");
        if (mode === 'PASS_BOOM' && timerSeconds <= 10 && (card.type === 'CHALLENGE' && card.minTimeRequired && card.minTimeRequired > 5)) {
            throw new Error("Complex challenge forbidden in speed round");
        }

        return card;

    } catch (err) {
        console.warn("AI Generation Failed or Invalid:", err);
        return getFallbackCard(mode, category);
    }
}

// --- FALLBACK SYSTEM ---
// Selects a random card from local data that matches the mode
function getFallbackCard(mode: GameMode, category: string): GameCard {
    const list = DATA_FALLBACK[mode] || [];
    if (list.length === 0) return {
        mode,
        type: 'QUESTION',
        text: 'Fallback error: No cards found.',
        safe: true
    };

    // Simple random selection from local fallback
    // In a real scenario, we could filter by category if local data supports it
    const random = list[Math.floor(Math.random() * list.length)];
    return {
        ...random,
        mode, // Ensure mode matches
        safe: true
    };
}
