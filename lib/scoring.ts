/**
 * SOBEK PLAY SCORING SYSTEM
 * Dual Currency: XP (Progression) vs SCORE (Ranking)
 */

export interface GameResult {
    xp: number;
    score: number;
    teamPoints: number;
}

export type GameMode = 'SOLO' | 'VERSUS';
export type MatchOutcome = 'WIN' | 'LOSS' | 'DRAW' | 'QUIT';

export interface ScoringParams {
    mode: GameMode;
    outcome: MatchOutcome;
    isPerfect?: boolean; // All correct
    isFast?: boolean;    // Speed bonus
}

/**
 * Calculates the XP, Score, and Team Points based on game result.
 */
export function calculateGameResult(params: ScoringParams): GameResult {
    const { mode, outcome, isPerfect, isFast } = params;

    let xp = 0;
    let score = 0;
    let teamPoints = 0; // Only added on Win/Draw

    if (mode === 'SOLO') {
        switch (outcome) {
            case 'WIN':
                xp = 20;
                score = 15;
                teamPoints = 10;
                // Bonuses
                if (isPerfect) score += 5;
                if (isFast) score += 3;
                break;
            case 'LOSS':
                xp = 5; // Console prize (Education)
                score = 0;
                teamPoints = 0;
                break;
            case 'QUIT':
                xp = 0;
                score = -5; // Penalty
                teamPoints = -5; // Team penalty
                break;
        }
    } else if (mode === 'VERSUS') {
        switch (outcome) {
            case 'WIN':
                xp = 25;
                score = 30;
                teamPoints = 30;
                break;
            case 'LOSS':
                xp = 10;
                score = -15; // Hard loss
                teamPoints = 0;
                break;
            case 'DRAW':
                xp = 15;
                score = 5;
                teamPoints = 10;
                break;
            case 'QUIT':
                xp = 0;
                score = -30; // Rage quit
                teamPoints = -20;
                break;
        }
    }

    return { xp, score, teamPoints };
}

/**
 * Sobek Intelligence Logic (Stages)
 * Returns points for a single stage.
 */
export function calculateStageResult(isCorrect: boolean): { xp: number, score: number } {
    if (isCorrect) {
        return { xp: 5, score: 3 };
    }
    return { xp: 2, score: 0 }; // Fail but continued
}
