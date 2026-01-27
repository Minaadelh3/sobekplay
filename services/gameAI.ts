/// <reference types="vite/client" />
// services/gameAI.ts

// --- CONFIG ---
// 🚨 Hardcoded Key as requested for connectivity test
const API_KEY = "AIzaSyD6LWEoWnDMlSq7-JkO3LSQ8hZmUuMLbj4";

// Using v1beta and gemini-1.5-flash (Supported & Fast)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// --- TYPES ---
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

// --- SYSTEM PROMPT ---
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
  "type": "QUESTION",
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

    const prompt = `
    نوع اللعبة: ${gameMode}
    الفئة: ${category}
    الصعوبة: ${difficulty}

    آخر كروت:
    ${recentHistory.slice(-20).join("\n")}
  `;

    try {
        console.log("🐊 Sobek AI: Sending Request to", API_URL);

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

        // Deep Debugging: Log full error text if not OK
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`🔥 API Error ${response.status}:`, errorBody);
            throw new Error(`Google API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("Empty Response from AI");

        // Clean Markdown code blocks if present
        const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();

        let card;
        try {
            card = JSON.parse(cleanJson);
        } catch (parseErr) {
            console.error("JSON Parse Error:", parseErr, "Raw Text:", rawText);
            throw new Error("Invalid JSON from AI");
        }

        // Ensure ID exists
        if (!card.id) card.id = crypto.randomUUID();

        return card;

    } catch (err) {
        console.error("Gemini Failure:", err);
        return null;
    }
}
