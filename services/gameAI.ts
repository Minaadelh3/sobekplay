/// <reference types="vite/client" />
// services/gameAI.ts

// --- CONFIG ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// --- TYPES ---
export type GameMode = 'عدّيها 💣' | 'قول ولا تفوّت؟ 😏' | 'فيلم بالإيموجي 🎬' | 'كمّلها بقى…' | 'حدوتة على الطاير ✨' | 'أسواني أصلي 🐊' | string;

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface AIResponse {
    text: string;
    action?: 'START_TIMER' | 'NONE';
    timerSeconds?: number;
    safe: boolean;
}

// --- SAFE FALLBACKS (For offline/error states) ---
const SAFE_CARDS: AIResponse[] = [
    { text: "النت بعافية شوية... بس ولا يهمك! قولنا موقف مضحك حصل معاك في الرحلة دي؟ 😂", action: "NONE", safe: true },
    { text: "سوبيك بياخد قيلولة 🐊... قولي، إيه أكتر أكلة عجبتك في أسوان لحد دلوقتي؟", action: "NONE", safe: true },
    { text: "السيستم مهنج بس إحنا مكملين! 🎤 غني كوبليه من أغنية 'يا بتاع النعناع'...", action: "NONE", safe: true }
];

// --- POWER PROMPT ---
const SYSTEM_PROMPT = `
Role: You are "Sobek" (سوبيك), an Egyptian "Saye3" Game Master (صايع وجدع).
Tone: Heavy Egyptian Slang (Sarsagy/Gen-Z/Street). Sarcastic but friendly (بيحب التلقيح والهزار).
Context: We are on a Church Trip to Aswan (رحلة ترفيهية).

Your Knowledge Base:
1. Egyptian Cinema: Classics (Adel Emam) to 2025 hits (Karim Abdel Aziz).
2. Proverbs: Deep 'Amthal Sha3beya' (أمثال شعبية).
3. Aswan Culture: Nubia, Philae, Heissa Island, The Nile, Crocodiles.
4. Trip Vibes: Bus rides, late snacks, mahraganat music.

Difficulty Levels (1-5):
- Level 1 (Hafalt): Very easy, popular movies, gentle dares.
- Level 3 (Medium): Tricky riddles, obscure movie quotes.
- Level 5 (Afya): Extremely deep Aswan history, specialized cinema trivia, "Embarrassing but Safe" dares.

Rules:
1. Receive 'History' and 'Difficulty'.
2. Respond to the user's last message with slang.
3. If it's a Game Turn, generate a challenge based on the Mode and Level.
4. "عدّيها 💣": Questions must be short. Timer DECREASES as difficulty INCREASES.
5. "فيلم بالإيموجي 🎬": Use complex emojis for Level 4-5.
6. "أسواني أصلي 🐊": Focus ONLY on Aswan/Nubian facts/trivia.

Output JSON ONLY:
{
  "text": "Your slang response + The Challenge",
  "action": "START_TIMER" | "NONE", 
  "timerSeconds": number (Optional),
  "safe": true
}
`;

export async function sendGameMessage(
    gameMode: string,
    category: string,
    difficulty: number, // 1-5
    history: ChatMessage[]
): Promise<AIResponse> {

    const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const initialPrompt = `
    System Instructions: ${SYSTEM_PROMPT}

    Current Game Context:
    - Mode: ${gameMode}
    - Category: ${category}
    - Difficulty Level: ${difficulty}/5
    `;

    if (geminiHistory.length > 0) {
        geminiHistory[0].parts[0].text = initialPrompt + "\n---\n" + geminiHistory[0].parts[0].text;
    } else {
        geminiHistory.push({
            role: "user",
            parts: [{ text: initialPrompt + "\n---\n" + "يلا يا سوبيك، ابدأ اللعبة وعرفنا بنفسك!" }]
        });
    }

    try {
        console.log("🐊 AI Request Sent: Mode=", gameMode, "Diff=", difficulty);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: geminiHistory,
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error(`API ${response.status}`);

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty Response");

        console.log("🐊 AI Response Received:", rawText.substring(0, 50) + "...");

        const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (err) {
        console.error("Sobek Fallback Triggered:", err);
        // Return a random safe card
        return SAFE_CARDS[Math.floor(Math.random() * SAFE_CARDS.length)];
    }
}
