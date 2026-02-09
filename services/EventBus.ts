import { GameEvent, GameEventType, GameEventPayload } from '../types/Events';

type EventHandler = (event: GameEvent) => void | Promise<void>;

class EventBusService {
    private handlers: Map<GameEventType | '*', EventHandler[]> = new Map();

    subscribe(eventType: GameEventType | '*', handler: EventHandler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)?.push(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(eventType);
            if (handlers) {
                this.handlers.set(eventType, handlers.filter(h => h !== handler));
            }
        };
    }

    async dispatch(type: GameEventType, payload: Omit<GameEventPayload, 'timestamp'>) {
        const event: GameEvent = {
            type,
            payload: {
                ...payload,
                timestamp: Date.now()
            }
        };

        console.log(`[EventBus] Dispatching: ${type}`, event);

        // 1. Specific handlers
        const specificHandlers = this.handlers.get(type) || [];
        // 2. Wildcard handlers
        const wildCardHandlers = this.handlers.get('*') || [];

        const allHandlers = [...specificHandlers, ...wildCardHandlers];

        // We process local handlers concurrently.
        const localHandlersPromise = Promise.all(allHandlers.map(h => h(event).catch(err => {
            console.error(`[EventBus] Error in handler for ${type}:`, err);
        })));

        // 3. Write to Firestore for Backend Logic (The "Real" Source of Truth)
        // We import dynamically to avoid circular dependencies if any, and ensure it runs client-side.
        const firestoreWritePromise = import('../lib/firebase').then(async ({ db }) => {
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            try {
                await addDoc(collection(db, 'events'), {
                    userId: payload.userId,
                    name: type, // Matches 'trigger' in AchievementRules for Backend
                    timestamp: serverTimestamp(),
                    metadata: payload.metadata || {},
                    processed: false
                });
                console.log(`[EventBus] Synced ${type} to Firestore`);
            } catch (e) {
                console.error(`[EventBus] Failed to sync ${type} to Firestore`, e);
            }
        });

        await Promise.all([localHandlersPromise, firestoreWritePromise]);
    }
}

export const EventBus = new EventBusService();
