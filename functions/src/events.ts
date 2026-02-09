import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { evaluateAchievements, GameEvent } from './achievements/engine';

// Triggers when a new Event is written to Firestore
export const onEventCreated = functions.firestore
    .document('events/{eventId}')
    .onCreate(async (snap, context) => {
        const eventData = snap.data();
        const eventId = context.params.eventId;

        if (!eventData) return;
        if (eventData.processed) return; // Already processed

        const gameEvent: GameEvent = {
            id: eventId,
            userId: eventData.userId,
            name: eventData.name,
            timestamp: eventData.timestamp,
            metadata: eventData.metadata || {}
        };

        try {
            console.log(`🚀 Processing Event: ${gameEvent.name} for User: ${gameEvent.userId}`);
            await evaluateAchievements(gameEvent);
            console.log(`✅ Event Processed: ${eventId}`);
        } catch (error) {
            console.error(`❌ Error processing event ${eventId}:`, error);
            // Optionally write error to doc
            await snap.ref.update({
                processingError: error instanceof Error ? error.message : 'Unknown Error'
            });
        }
    });
