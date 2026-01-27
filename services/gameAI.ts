/// <reference types="vite/client" />
// services/gameAI.ts

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Using v1 (Stable) and gemini-1.5-flash
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// --- TYPES ---
export type GameMode = 'عدّيها 💣' | 'قول ولا تفوّت؟ 😏' | 'فيلم بالإيموجي 🎬' | 'كمّلها بقى…' | 'حدوتة على الطاير ✨' | string;

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface AIResponse {
    text: string;           // The Game Master's reply
    action?: 'START_TIMER' | 'NONE';
    timerSeconds?: number;  // If action is START_TIMER
    safe: boolean;
}

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
أنت "سوبيك"، جيم ماستر مصري أصيل (Game Master).
دورك مش بس تسأل، دورك تمشي اللعبة وتهزر مع الناس وتتريق عليهم (بخفة دم) لو اتأخروا.

شخصيتك:
- بتتكلم مصري عامية بحتة (Slang).
- دمك خفيف وبتحب التلقيح.
- لو حد قالك "مش عارف" أو سكت، سخّن عليه.
- لو اللعبة "عدّيها 💣"، كل سؤال لازم معاه تايمر.

المطلوب منك:
1. خد تاريخ المحادثة (Conversation History) كمدخلات.
2. رد على آخر رسالة من اليوزر.
3. لو الدور لعبة، ابعت السؤال والتايمر المناسب.
4. رجّع الرد دايماً JSON بالشكل ده:

{
  "text": "الرد بتاعك هنا يا سوبيك",
  "action": "START_TIMER", 
  "timerSeconds": 30,
  "safe": true
}

لو مفيش تايمر، خلي action: "NONE".
`;

export async function sendGameMessage(
    gameMode: string,
    category: string,
    history: ChatMessage[]
): Promise<AIResponse | null> {

    // 1. Construct the Chat History for Gemini
    // We filter out any previous system checks or errors, just filtered chat
    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    // 2. Add System Instruction as the first "user" part (simulate system)
    // or use the new system_instruction if available, but for v1/flash simple prompting is safer
    const initialPrompt = `
    System: ${SYSTEM_PROMPT}
     
    Context:
    Game Mode: ${gameMode}
    Category: ${category}
    `;

    // Prepend Context to the first message or create a new one if history is empty
    if (geminiHistory.length > 0) {
        geminiHistory[0].parts[0].text = initialPrompt + "\n---\n" + geminiHistory[0].parts[0].text;
    } else {
        geminiHistory.push({
            role: "user",
            parts: [{ text: initialPrompt + "\n---\n" + "يلا ابدأ اللعبة! عرفنا بنفسك واسأل أول سؤال." }]
        });
    }

    try {
        console.log("🐊 Sobek Chat: Sending...", geminiHistory.length, "messages");

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: geminiHistory,
                generationConfig: {
                    responseMimeType: "application/json" // Force JSON output
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`🔥 API Error ${response.status}:`, errorBody);
            throw new Error(`Google API Error: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("Empty Response from AI");

        // Parse JSON
        const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
        const parsed: AIResponse = JSON.parse(cleanJson);

        return parsed;

    } catch (err) {
        console.error("Gemini Failure:", err);
        return null;
    }
}
