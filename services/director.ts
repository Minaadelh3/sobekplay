// services/director.ts
import { Card, GameSession, IntensityLevel, GameModeId } from '../types/partyEngine';
import { MASTER_DECKS } from '../data/curatedDecks';

interface SessionState {
    startTime: number;
    cardCount: number;
    currentCurve: 'warmup' | 'ramp' | 'peak' | 'cooldown';
    lastTags: string[];
    history: Set<string>;
}

export class DirectorService {
    private mode: GameModeId;
    private availableCards: Card[];
    private state: SessionState;

    constructor(mode: GameModeId, deckIds: string[]) {
        this.mode = mode;
        this.state = {
            startTime: Date.now(),
            cardCount: 0,
            currentCurve: 'warmup',
            lastTags: [],
            history: new Set()
        };

        // Load Decks
        const selectedDecks = MASTER_DECKS[mode]
            .filter(deck => deckIds.includes(deck.id) || deckIds.length === 0);

        // Fallback if empty
        const sourceDecks = selectedDecks.length > 0 ? selectedDecks : MASTER_DECKS[mode];
        this.availableCards = sourceDecks.flatMap(d => d.cards);
    }

    /**
     * THE CORE ALGORITHM
     * Selects the next card based on the "Egyptian Social Curve".
     */
    public getNextCard(): Card | null {
        if (this.availableCards.length === 0) return null;

        // 1. Determine Target Vibe based on flow
        this.updateCurveState();
        const targetIntensity = this.getTargetIntensity();
        const maxDanger = this.getMaxSocialDanger();

        // 2. Score all available cards
        const rankedCards = this.availableCards
            .filter(c => !this.state.history.has(c.id)) // Remove played
            .map(card => {
                return {
                    card,
                    score: this.calculateCardScore(card, targetIntensity, maxDanger)
                };
            });

        // 3. Sort by Score + Entropy
        rankedCards.sort((a, b) => b.score - a.score);

        // 4. Select Top Candidate (with slight fuzziness for variety)
        // Take top 3 and pick random one to avoid total determinism
        const topCandidates = rankedCards.slice(0, 3);
        if (topCandidates.length === 0) {
            // Reset history if exhausted (Infinite Mode)
            this.state.history.clear();
            return this.getNextCard();
        }

        const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)].card;

        // 5. Update State
        this.recordPlay(selected);

        return selected;
    }

    private updateCurveState() {
        const count = this.state.cardCount;
        // Session Pacing (Simplified for MVP)
        if (count < 3) this.state.currentCurve = 'warmup';
        else if (count < 8) this.state.currentCurve = 'ramp';
        else if (count < 15) this.state.currentCurve = 'peak';
        else this.state.currentCurve = 'cooldown';
        // In a real endless mode, 'cooldown' loops back to 'ramp'
        if (count > 20) this.state.currentCurve = 'ramp';
    }

    private getTargetIntensity(): number {
        switch (this.state.currentCurve) {
            case 'warmup': return 2;  // Low intensity start
            case 'ramp': return 5;    // Building up
            case 'peak': return 9;    // Heavy stuff
            case 'cooldown': return 4;// Relief
            default: return 3;
        }
    }

    private getMaxSocialDanger(): number {
        switch (this.state.currentCurve) {
            case 'warmup': return 2;  // Safe only
            case 'ramp': return 5;    // Mild awkwardness allowed
            case 'peak': return 10;   // Anything goes
            case 'cooldown': return 4;// Back to safety
            default: return 3;
        }
    }

    private calculateCardScore(card: Card, targetIntensity: number, maxDanger: number): number {
        let score = 100;

        // A. Intensity Proximity (Bell Curve preference)
        // We prefer cards CLOSE to the target intensity.
        const intensityDiff = Math.abs(card.intensity - targetIntensity);
        score -= intensityDiff * 15; // Heavy penalty for wrong vibe

        // B. Safety Check (Hard Filter turned into soft penalty for sorting)
        if (card.socialDanger > maxDanger) {
            score -= 500; // Buried at bottom
        }

        // C. Replay Fatigue (Simulated)
        score -= (card.replayFatigue || 0) / 2;

        // D. Tag Repetition (Don't show 3 'acting' cards in a row)
        // Check last 2 tags
        const recentTags = this.state.lastTags.slice(-2);
        if (card.tags.some(t => recentTags.includes(t))) {
            score -= 40; // Penalty for repetition
        }

        // E. Tone Matching
        // If we are in 'Peak', prefer 'Heavy' or 'Serious'
        if (this.state.currentCurve === 'peak' && (card.tone === 'heavy' || card.mood === 'tense')) {
            score += 20;
        }
        // If we are in 'Warmup', prefer 'Playful'
        if (this.state.currentCurve === 'warmup' && card.tone === 'playful') {
            score += 20;
        }

        return score + Math.random() * 10; // Add entropy
    }

    private recordPlay(card: Card) {
        this.state.history.add(card.id);
        this.state.cardCount++;
        this.state.lastTags = [...this.state.lastTags, ...(card.tags || [])].slice(-5);
    }

    public getSessionStats() {
        return {
            cardsPlayed: this.state.cardCount,
            curve: this.state.currentCurve,
            intensityTarget: this.getTargetIntensity(),
            remaining: this.availableCards.length - this.state.history.size
        };
    }
}
