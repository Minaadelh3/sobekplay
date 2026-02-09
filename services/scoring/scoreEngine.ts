
import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
    getDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    setDoc,
    Timestamp,
    increment,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Adjust path if needed

/**
 * UNIFIED SCORING ENGINE
 * Single source of truth for all points/XP awards.
 */

// --- Types ---

export interface AwardPointsParams {
    userId?: string; // Optional (if targeting Team directly)
    teamId?: string; // Optional (derived if userId present)
    actionType: string;
    points: number;
    idempotencyKey: string;
    metadata?: any;
    reason?: string; // Human readable reason for audit
}

export interface ScoreEvent {
    id: string; // idempotencyKey
    userId: string;
    teamId?: string;
    actionType: string;
    pointsDelta: number;
    createdAt: any;
    metadata?: any;
    reason?: string;
}

export interface TransactionResult {
    success: boolean;
    newTotalValid: boolean; // Just a flag
    userTotal: number;
    teamTotal: number;
    message?: string;
}

// --- API ---

/**
 * Awards points to a user and their team transactionally.
 * Idempotent: Subsequent calls with same idempotencyKey are ignored.
 */
export async function awardPoints(params: AwardPointsParams): Promise<TransactionResult> {
    if (!params.idempotencyKey) throw new Error("idempotencyKey is required for scoring.");
    if (params.points === 0) return { success: true, newTotalValid: true, userTotal: 0, teamTotal: 0, message: "Zero points awarded." };

    try {
        return await runTransaction(db, async (transaction) => {
            // 1. Check Idempotency
            const eventRef = doc(db, 'scoreEvents', params.idempotencyKey);
            const eventSnap = await transaction.get(eventRef);

            if (eventSnap.exists()) {
                console.warn(`[ScoreEngine] Duplicate event skipped: ${params.idempotencyKey}`);
                return { success: true, newTotalValid: true, userTotal: -1, teamTotal: -1, message: "Duplicate event skipped." };
            }

            // 2. Resolve User & Team
            let userRef = null;
            let userData = null;
            let teamId = params.teamId;

            if (params.userId) {
                userRef = doc(db, 'users', params.userId);
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) throw new Error(`User ${params.userId} not found.`);
                userData = userSnap.data();
                teamId = teamId || userData.teamId;
            }

            if (!params.userId && !teamId) {
                throw new Error("Either userId or teamId must be provided for scoring.");
            }

            let teamRef = null;
            let teamSnap = null;

            if (teamId) {
                teamRef = doc(db, 'teams', teamId);
                teamSnap = await transaction.get(teamRef);
            }

            // 3. Create Score Event
            const eventData: ScoreEvent = {
                id: params.idempotencyKey,
                userId: params.userId || null,
                teamId: teamId || null,
                actionType: params.actionType,
                pointsDelta: params.points,
                createdAt: serverTimestamp(),
                metadata: params.metadata || {},
                reason: params.reason || ''
            };
            transaction.set(eventRef, eventData);

            // 4. Update User Totals
            let newUserTotal = 0;
            if (userRef && userData) {
                newUserTotal = (userData.scoreTotal || 0) + params.points;
                transaction.update(userRef, {
                    scoreTotal: increment(params.points),
                    points: increment(params.points), // Legacy sync
                    xp: increment(params.points),     // Legacy sync
                    scoreUpdatedAt: serverTimestamp()
                });
            }

            // 5. Update Team Totals
            let newTeamTotal = 0;
            if (teamRef && teamSnap && teamSnap.exists()) {
                const teamData = teamSnap.data();
                newTeamTotal = (teamData.scoreTotal || 0) + params.points;

                transaction.update(teamRef, {
                    scoreTotal: increment(params.points),
                    points: increment(params.points),      // Legacy sync
                    xp: increment(params.points),          // Legacy sync
                    totalPoints: increment(params.points), // Legacy sync
                    scoreUpdatedAt: serverTimestamp()
                });
            }

            return {
                success: true,
                newTotalValid: true,
                userTotal: newUserTotal,
                teamTotal: newTeamTotal
            };
        });
    } catch (error) {
        console.error("[ScoreEngine] Transaction failed:", error);
        throw error;
    }
}

/**
 * Get User Score (Single Call)
 */
export async function getUserScore(userId: string): Promise<number> {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data().scoreTotal || snap.data().xp || 0) : 0;
}

/**
 * Get Team/Account Score (Single Call)
 */
export async function getTeamScore(teamId: string): Promise<number> {
    const snap = await getDoc(doc(db, 'teams', teamId));
    return snap.exists() ? (snap.data().scoreTotal || snap.data().points || 0) : 0;
}

/**
 * Real-time Subscription to Scores
 * Returns a function to unsubscribe from BOTH listeners.
 */
export function subscribeToScores(
    userId: string,
    callback: (userScore: number, teamScore: number) => void
): Unsubscribe {
    let teamUnsub: Unsubscribe | null = null;
    let currentTeamId: string | null = null;
    let latestUserScore = 0;
    let latestTeamScore = 0;

    const triggerCallback = () => {
        callback(latestUserScore, latestTeamScore);
    };

    // 1. Listen to User
    const userUnsub = onSnapshot(doc(db, 'users', userId), (userSnap) => {
        if (!userSnap.exists()) return;
        const uData = userSnap.data();
        latestUserScore = uData.scoreTotal || uData.xp || 0;
        const newTeamId = uData.teamId;

        // If team changed or first time, resubscribe to team
        if (newTeamId && newTeamId !== currentTeamId) {
            if (teamUnsub) teamUnsub();
            currentTeamId = newTeamId;

            teamUnsub = onSnapshot(doc(db, 'teams', newTeamId), (teamSnap) => {
                if (teamSnap.exists()) {
                    const tData = teamSnap.data();
                    latestTeamScore = tData.scoreTotal || tData.points || 0;
                    triggerCallback();
                }
            });
        } else if (!newTeamId) {
            if (teamUnsub) teamUnsub();
            currentTeamId = null;
            latestTeamScore = 0;
        }

        // Always trigger callback on user update
        triggerCallback();
    });

    // Return a composite unsubscribe function
    return () => {
        userUnsub();
        if (teamUnsub) teamUnsub();
    };
}

// Helper to generate consistent keys
export function generateIdempotencyKey(actionType: string, userId: string, uniqueId: string): string {
    return `${actionType}:${userId}:${uniqueId}`;
}
