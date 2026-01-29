
/**
 * Sobek Chat Client
 * Pure fetch wrapper. No complex logic.
 */

export interface ChatResponse {
    reply: string;
    suggestions: any[];
}

export async function sendMessageToApi(message: string): Promise<ChatResponse> {
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Add Timestamp to prevent caching
            body: JSON.stringify({
                message,
                ts: Date.now()
            }),
        });

        const data = await res.json();

        return {
            reply: data.reply || "...",
            suggestions: [] // Future proofing
        };

    } catch (e) {
        console.error(e);
        return {
            reply: "معلش في مشكلة في الاتصال.. جرب تاني!",
            suggestions: []
        };
    }
}
