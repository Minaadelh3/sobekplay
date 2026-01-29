// Types are defined locally to avoid circular dependencies

// Redefine types to match Component usage
export interface ChatSuggestion {
    label: string;
    actionType: 'NAVIGATE' | 'ROOM_LOOKUP' | 'OPEN_GAME' | 'OPEN_PROGRAM_DAY' | 'RESET_TAB' | 'CHANGE_NAME';
    payload: any;
}

export interface ChatResponse {
    replyText: string;
    suggestions: ChatSuggestion[];
}

/**
 * Sends a message to the Sobek AI API.
 * Now simplified to send only the latest message string.
 */
export const sendMessageToApi = async (messages: any[], currentGuestId: string | null): Promise<ChatResponse> => {
    try {
        // Extract the last user message text
        const lastUserMessage = messages[messages.length - 1];
        if (!lastUserMessage || !lastUserMessage.content) {
            throw new Error("No message content found to send.");
        }

        const messageText = lastUserMessage.content;

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error("Global API Error:", res.status, errData);
            throw new Error(errData.details || `Server Error (${res.status})`);
        }

        const data = await res.json();

        // Return in the format the UI expects
        return {
            replyText: data.reply || "معلش، مفهمتش قصدك. ممكن توضح؟",
            suggestions: [] // AI doesn't return suggestions yet, UI handles local ones
        };

    } catch (err) {
        console.error("Chat Client Failure:", err);
        // Fallback for UI to prevent crash
        return {
            replyText: "معلش السيرفر واقع دلوقتي 🐊.. جرب كمان شوية!",
            suggestions: []
        };
    }
};
