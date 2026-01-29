
// Local Types
export interface ChatResponse {
    replyText: string;
    suggestions: any[];
}

const API_Endpoint = '/api/chat';

export const sendMessageToApi = async (messages: any[], currentGuestId: string | null): Promise<ChatResponse> => {
    // 1. Client-side Validation
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.content) {
        return { replyText: "...", suggestions: [] };
    }

    try {
        // 2. Fetch with Network Timeout (Front-end limit)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const response = await fetch(API_Endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: lastMsg.content }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 3. Handle HTTP Errors
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        return {
            replyText: data.reply || "تمام!",
            suggestions: []
        };

    } catch (error: any) {
        console.warn("Chat Fail (Handled):", error.message);

        // 4. Stable Fallback (User Friendly)
        // Never crash the UI. Always return a message.
        return {
            replyText: "معلش، السيرفر عليه ضغط أو النت بطيء. جرب تاني! 🐊",
            suggestions: []
        };
    }
};
