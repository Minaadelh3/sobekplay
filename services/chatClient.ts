
/**
 * Sobek Chat Client
 * Diagnostic wrapper for fetch.
 */

export interface ChatResponse {
    reply: string;
    meta?: any;
    suggestions: any[];
}

export async function sendMessageToApi(message: string): Promise<ChatResponse> {
    const localRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    console.log(`[ChatClient] Sending ${localRequestId}:`, message);

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                requestId: localRequestId
            }),
        });

        // Safety: Prevent parsing crashes on non-JSON responses
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error(`[ChatClient] JSON Parse Error on ${localRequestId}:`, text);
            throw new Error("Invalid JSON Response");
        }

        console.log(`[ChatClient] Received ${localRequestId}:`, data.meta);

        return {
            reply: data.reply || "...",
            meta: data.meta,
            suggestions: []
        };

    } catch (e: any) {
        console.error(`[ChatClient] Network/Logic Fail ${localRequestId}:`, e);
        return {
            reply: "معلش في مشكلة في الاتصال.. جرب تاني!",
            suggestions: []
        };
    }
}
