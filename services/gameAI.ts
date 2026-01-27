/// <reference types="vite/client" />
// services/gameAI.ts

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

// --- TYPES (Matching User Request) ---
export type GameMode = 'عدّيها 💣' | 'قول ولا تفوّت؟ 😏' | 'فيلم بالإيموجي 🎬' | 'كمّلها بقى…' | 'حدوتة على الطاير ✨' | string;

export interface GameCard {
    id: string;
    type: 'QUESTION' | 'TASK' | 'EMOJI' | 'PROVERB' | 'STARTER' | 'PENALTY';
    text: string;
    emoji?: string | null;
    answer?: string | null;
    minTimeRequired: number;
    safe: boolean;
}

// --- NEW EGYPTIAN SYSTEM PROMPT ---
const SYSTEM_PROMPT_TEMPLATE = (timerSeconds: number) => `
أنت مصري قاعد في قعدة لعب.
طلّع كارت واحد فقط.

قواعد:
- اللغة: مصري فقط
- ما تكررشي أي حاجة شبه اللي فات
- لازم يناسب تايمر ${timerSeconds} ثانية
- لو التايمر أقل من 10 ثواني: سؤال كلامي سريع فقط
- ممنوع أي محتوى محرج أو صريح

رجّع JSON فقط بالشكل ده:
{
  "id": "unique-id",
  "type": "QUESTION | TASK | EMOJI | PROVERB | STARTER | PENALTY",
  "text": "نص مصري",
  "emoji": null,
  "answer": null,
  "minTimeRequired": number,
  "safe": true
}
`;

export async function generateGameCard(
    gameMode: string,
    category: string,
    timerSeconds: number,
    difficulty: any,
    recentHistory: string[]
): Promise<GameCard | null> {

    if (!API_KEY) {
        console.warn("Missing API Key");
        return null;
    }

    const prompt = `
    نوع اللعبة: ${gameMode}
    الفئة: ${category}
    الصعوبة: ${difficulty}

    آخر كروت:
    ${recentHistory.slice(-20).join("\n")}
  `;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: SYSTEM_PROMPT_TEMPLATE(timerSeconds) + "\n" + prompt }]
                    }
                ]
            })
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("Empty Response");

        const card = JSON.parse(rawText);

        // Ensure ID exists
        if (!card.id) card.id = crypto.randomUUID();

        return card;

    } catch (err) {
        console.error("Gemini Failure:", err);
        // Retry Logic could go here, but for now returning null lets UI handle "Retry"
        return null;
    }
}
