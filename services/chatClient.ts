
import { ChatSuggestion } from './roomsDirectory'; // Ensure simple import or define locally

// Interfaces
export interface ChatResponse {
    replyText: string;
    suggestions: any[]; // Kept generic to avoid type conflicts
}

const API_ENDPOINT = "/api/chat";

/**
 * Safe client to communicate with Serverless API.
 * NEVER exposes API keys.
 */
export const sendMessageToApi = async (messages: any[], currentGuestId: string | null): Promise<ChatResponse> => {
    try {
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg?.content) throw new Error("Empty message");

        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: lastMsg.content }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server Error ${response.status}`);
        }

        return {
            replyText: data.reply || "معلش، مفهمتش. ممكن تقول تاني؟",
            suggestions: []
        };

    } catch (error) {
        console.error("CHAT_CLIENT_ERROR:", error);

        // Friendly Arabic Fallback
        return {
            replyText: "معلش يا كبير، الشبكة تعبانة شوية… جرّب تاني كمان شوية 👋",
            suggestions: []
        };
    }
};
