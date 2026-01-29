import { GoogleGenAI } from '@google/genai';

export const config = {
    runtime: 'edge', // or 'nodejs'
};

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { messages, websiteContext } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Error: GEMINI_API_KEY is missing in server environment.");
            return new Response(JSON.stringify({
                error: "Server Configuration Error",
                details: "API Key not configured"
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        // SYSTEM PROMPT
        const systemPrompt = `
You are ابن أخو سوبك، مساعد مصري بيتكلم عامية. ردودك قصيرة، ذكية، ومش رسمية. ساعد المستخدم في أي حاجة في الموقع.
لو جالك سياق عن بيانات الموقع استخدمه فوراً. في الآخر اقترح دايمًا 2–4 اختيارات مفيدة للمستخدم.

CONTEXT:
${websiteContext ? JSON.stringify(websiteContext, null, 2) : "No context provided"}

FORMAT:
Return strictly a JSON object (no markdown) with:
{
  "replyText": "Arabic text reply here",
  "suggestions": [
     { "label": "Button text", "actionType": "NAVIGATE|ROOM_LOOKUP|OPEN_GAME|OPEN_PROGRAM_DAY|RESET_TAB|CHANGE_NAME", "payload": { "path": "...", "query": "..." } }
  ]
}
    `;

        // TRANSFORM MESSAGES
        const lastMessage = messages[messages.length - 1].content;
        const previousHistory = messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n');

        const combinedPrompt = `
CHAT HISTORY:
${previousHistory}

USER MESSAGE:
${lastMessage}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
            config: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                responseMimeType: 'application/json',
                temperature: 0.8,
                maxOutputTokens: 500,
            }
        });

        const outputText = response.text;
        if (!outputText) throw new Error("Empty AI response");

        const parsed = JSON.parse(outputText);

        return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
