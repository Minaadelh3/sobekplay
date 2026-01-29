import { GAMES_CATALOG } from '../pages/GamesPage';
import { EPISODES } from '../pages/ProgramPage';
import { findGuest, getRoommates, getRoomLabel, GuestResult } from './roomsDirectory';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatSuggestion {
    label: string;
    actionType: 'NAVIGATE' | 'ROOM_LOOKUP' | 'OPEN_GAME' | 'OPEN_PROGRAM_DAY' | 'RESET_TAB' | 'CHANGE_NAME';
    payload: any;
}

export interface ChatResponse {
    replyText: string;
    suggestions: ChatSuggestion[];
}

// --- CONTEXT GATHERER ---
export const gatherContext = (currentGuestId: string | null) => {
    const context: any = {};

    // 1. Guest Info (if logged in)
    if (currentGuestId) {
        const guest = findGuest(currentGuestId);
        if (guest.found && guest.assignment) {
            context.user = {
                name: guest.assignment.personName,
                room: guest.assignment.room,
                floor: guest.assignment.floor,
                roomLabel: getRoomLabel(guest.assignment.room),
                roommates: getRoommates(guest.assignment)
            };
        }
    }

    // 2. Games Catalog (Titles & Descriptions)
    context.games = GAMES_CATALOG.map(g => ({ title: g.title, desc: g.desc, id: g.id }));

    // 3. Program (Day Titles)
    context.program = EPISODES.map(e => ({ day: e.date, title: e.title, id: e.id }));

    return context;
};

// --- API CLIENT ---
export const sendMessageToApi = async (messages: ChatMessage[], currentGuestId: string | null): Promise<ChatResponse> => {
    try {
        const websiteContext = gatherContext(currentGuestId);

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, websiteContext })
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        return data as ChatResponse;

    } catch (err) {
        console.error("Chat Client Error:", err);
        return {
            replyText: "معلش الشبكة قطعت.. جرب تاني كمان شوية.",
            suggestions: []
        };
    }
};
