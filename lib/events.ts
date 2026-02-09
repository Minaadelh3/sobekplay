import { EventBus } from '../services/EventBus';
import { GameEventType, GameEventPayload } from '../types/Events';

export interface EventMetadata {
    [key: string]: any;
}

/**
 * Tracks a user event by dispatching it to the EventBus.
 * This ensures listeners (UI) and Backend (Firestore) both get it.
 * 
 * @param userId - The ID of the user performing the action.
 * @param eventName - The specific event name (e.g. 'GAME_COMPLETED').
 * @param metadata - Additional context (e.g. { gameId: 'mafia', score: 100 }).
 */
export async function trackEvent(userId: string, eventName: string, metadata: EventMetadata = {}) {
    if (!userId) {
        console.warn("⚠️ [Events] trackEvent called without userId");
        return;
    }

    // Cast string to GameEventType (loose typing for legacy compat)
    // In strict mode we should fix callsites, but for now we bridge it.
    const eventType = eventName as GameEventType;

    await EventBus.dispatch(eventType, {
        userId,
        metadata
    });
}
