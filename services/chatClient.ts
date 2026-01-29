
/**
 * Sobek Chat Client (Production)
 * Connects to local API (via proxy) or Vercel Serverless.
 */

export interface ChatResponse {
    reply: string;
    suggestions?: any[];
    meta?: any;
    error?: boolean;
}

export async function sendMessageToApi(message: string): Promise<ChatResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Debug Log
    console.log(`[ChatClient] Sending ${requestId}:`, message);

    try {
        // Use relative path so Vite proxy (dev) or Vercel (prod) handles it
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message,
                requestId
            }),
        });

        // 1. HTTP Error Check
        if (!res.ok) {
            const errText = await res.text();
            console.error(`[ChatClient] HTTP Error ${res.status}:`, errText);

            // Return failure object instead of throwing (keep UI alive)
            return {
                reply: "معلش السيرفر زعلان شوية.. جرب تاني كمان دقيقة! 🐊",
                error: true
            };
        }

        // 2. Safe JSON Parsing
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error(`[ChatClient] Bad JSON:`, text);
            return {
                reply: "معلش البيانات وصلت غلط.. جرب تاني!",
                error: true
            };
        }

        console.log(`[ChatClient] Success ${requestId}:`, data);

        // 3. Return Clean Data
        // Prioritize 'reply' field. If empty, fallback DYNAMICALLY here (with timestamp).
        const finalReply = data.reply && data.reply.trim()
            ? data.reply
            : `معلش مسمعتش.. قول تاني؟ (${new Date().toLocaleTimeString('en-EG')})`;

        return {
            reply: finalReply,
            suggestions: data.suggestions || [],
            meta: data.meta
        };

    } catch (e: any) {
        console.error(`[ChatClient] Network Fail:`, e);
        return {
            reply: "النت فاصل أو السيرفر واقع.. اتأكد من النت! 📶",
            error: true
        };
    }
}
