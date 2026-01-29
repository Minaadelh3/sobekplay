
// Types defined locally to prevent circular dependencies
export interface ChatSuggestion {
    label: string;
    actionType: string;
    payload: any;
}

export interface ChatResponse {
    replyText: string;
    suggestions: ChatSuggestion[];
}

const API_URL = '/api/chat';

/**
 * Secure Chat Client
 * - Only sends POST
 * - Never throws fatal UI errors
 * - Provides Arabic fallback on failure
 */
export const sendMessageToApi = async (messages: any[], currentGuestId: string | null): Promise<ChatResponse> => {
    try {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage?.content) return { replyText: "...", suggestions: [] };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message: lastMessage.content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Error ${response.status}`);
        }

        return {
            replyText: data.reply || "تمام يا غالي!",
            suggestions: []
        };

    } catch (error) {
        console.error("Chat Client Error:", error);

        // GRACEFUL FALLBACK - NO CRASH
        return {
            replyText: "معلش الشبكة مش تمام دلوقتي.. جرب تاني كمان شوية! �",
            suggestions: []
        };
    }
};
