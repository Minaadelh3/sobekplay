/// <reference types="vite/client" />
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
LOGIC RULES
--------------------------------
- If timer <= 10 seconds:
  ONLY instant verbal questions.
- No acting tasks in speed rounds.
- No long storytelling unless explicitly allowed.
- One card = one simple action or question.

--------------------------------
CONTENT STYLE
--------------------------------
Spicy = bold + playful + teasing  
NOT explicit, NOT sexual, NOT humiliating  
Keep it: Light, Social, Inclusive, Safe.

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
- Show only the first half.
- Always know the exact completion.
- Keep it Egyptian and common.

--------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------
Return ONLY one card at a time in valid JSON.
Matches Application Interface:

{
  "mode": "PASS_BOOM | TRUTH_DARE | EMOJI_MOVIES | PROVERBS | STORY_CHAIN",
  "type": "QUESTION | CHALLENGE | EMOJI | PROVERB | STARTER | PENALTY",
  "category": "string",
  "text": "Masry card text",
  "answers": ["exact answer (optional)"],
  "emoji": "emoji string (optional)",
  "movieTitle": "exact movie title (optional)",
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
