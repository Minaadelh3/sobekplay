// services/director.ts
import { Card, GameSession, IntensityLevel, GameModeId } from '../types/partyEngine';
import { MASTER_DECKS } from '../data/curatedDecks';

export class DirectorService {
    private mode: GameModeId;
    private sessionHistory: Set<string>;
    private availableCards: Card[];
    private currentIntensity: number; // 1.0 to 5.0 (float)

    constructor(mode: GameModeId, deckIds: string[]) {
        this.mode = mode;
        this.sessionHistory = new Set();
        this.currentIntensity = 1.0;

        // Flatten selected decks into a playable pool
        this.availableCards = MASTER_DECKS[mode]
            .filter(deck => deckIds.includes(deck.id) || deckIds.length === 0) // Default to all if empty
            .flatMap(deck => deck.cards);

        if (this.availableCards.length === 0) {
            // Fallback: If no decks selected or found, load ALL decks for this mode
            this.availableCards = MASTER_DECKS[mode].flatMap(d => d.cards);
        }
    }

    // The Magic Algorithm
    public getNextCard(): Card | null {
        if (this.availableCards.length === 0) return null;

        // 1. Filter out history
        const freshCards = this.availableCards.filter(c => !this.sessionHistory.has(c.id));
        if (freshCards.length === 0) {
            // Reset history if we ran out of unique cards (Infinite Loop logic)
            this.sessionHistory.clear();
            return this.getNextCard(); // Recurse once
        }

        // 2. Score cards based on fit
        const scoredCards = freshCards.map(card => {
            let score = Math.random() * 10; // Base entropy

            // Intensity Fit: We want cards close to current intensity
            const dist = Math.abs(card.intensity - this.currentIntensity);
            score -= dist * 20; // High penalty for wrong intensity

            // Variety Fit: Prefer tags we haven't seen recently (simple logic for now)
            // ... extendable ...

            return { card, score };
        });

        // 3. Pick best fit
        scoredCards.sort((a, b) => b.score - a.score);
        const bestMatch = scoredCards[0].card;

        // 4. Update State
        this.sessionHistory.add(bestMatch.id);
        this.escalateIntensity();

        return bestMatch;
    }

    private escalateIntensity() {
        // Slowly heat up the room. Cap at 5.
        // If we are at 5, maybe wobble between 4 and 5
        if (this.currentIntensity < 5) {
            this.currentIntensity += 0.2; // +1 level every 5 cards roughly
        } else {
            // Chaos mode: Randomly dip to 3 or 4 to give relief?
            // For now, stay hot.
        }
    }

    public getSessionStats() {
        return {
            cardsPlayed: this.sessionHistory.size,
            currentIntensity: Math.floor(this.currentIntensity),
            cardsRemaining: this.availableCards.length - this.sessionHistory.size
        };
    }
}
