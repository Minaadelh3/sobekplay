import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from './firebase';

// --- Types ---

export type MatchStatus = 'waiting' | 'starting' | 'in_progress' | 'finished';
export type VersusTeam = 'A' | 'B';

export interface VersusPlayer {
    id: string;
    name: string;
    avatar: string;
    score: number;
    teamId?: string; // Original Team ID
    versusTeam?: VersusTeam; // 'A' (Red) or 'B' (Blue)
    ready?: boolean;
    lastAnswerCorrect?: boolean;
}

export interface MatchState {
    id: string;
    code: string;
    status: MatchStatus;
    createdBy: string;
    createdAt?: any;
    gameId: 'verse' | 'proverb' | 'sobek_intel'; // The selected game 
    players: Record<string, VersusPlayer>;
    currentQuestionIndex: number;
    roundStartTime?: any; // Server timestamp for sync
    winnerId?: string | 'draw';
    maxPlayers?: number; // 2 or 4
}

// --- Constants ---

export const VERSUS_GAME_IDS = ['proverb', 'verse', 'sobek_intel'];

// --- Actions ---

/**
 * Generates a random 4-digit code (e.g., 7421)
 */
const generateMatchCode = () => Math.floor(1000 + Math.random() * 9000).toString();

/**
 * Creates a new match and returns the ID
 */
export async function createMatch(host: { id: string, name: string, avatar: string, teamId?: string }, gameId: string, maxPlayers: number = 2) {
    const matchId = doc(collection(db, 'matches')).id;
    const code = generateMatchCode();

    const newMatch: MatchState = {
        id: matchId,
        code,
        status: 'waiting',
        createdBy: host.id,
        createdAt: serverTimestamp(),
        gameId: gameId as any,
        maxPlayers,
        players: {
            [host.id]: {
                id: host.id,
                name: host.name,
                avatar: host.avatar,
                teamId: host.teamId,
                score: 0,
                ready: false
            }
        },
        currentQuestionIndex: 0,
        roundStartTime: null
    };

    await setDoc(doc(db, 'matches', matchId), newMatch as any);
    return { matchId, code };
}

/**
 * Joins an existing match by Code
 */
export async function joinMatchByCode(code: string, player: { id: string, name: string, avatar: string, teamId?: string }) {
    // 1. Find match by code
    const q = query(
        collection(db, 'matches'),
        where('code', '==', code),
        where('status', '==', 'waiting'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("الماتش غير موجود أو بدأ بالفعل");

    const matchDoc = snapshot.docs[0];
    const matchData = matchDoc.data() as MatchState;

    if (Object.keys(matchData.players).length >= (matchData.maxPlayers || 2)) throw new Error("الماتش مكتمل العدد");
    if (matchData.players[player.id]) return matchDoc.id; // Already joined

    // 2. Add player
    const playerEntry: VersusPlayer = {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        teamId: player.teamId,
        score: 0,
        ready: false
    };

    await updateDoc(matchDoc.ref, {
        [`players.${player.id}`]: playerEntry
    });

    return matchDoc.id;
}

/**
 * Quick Match: Finds any waiting match or creates one
 */
export async function quickMatch(player: { id: string, name: string, avatar: string, teamId?: string }) {
    // Try to find open match
    const q = query(
        collection(db, 'matches'),
        where('status', '==', 'waiting'),
        limit(5)
    );

    const snapshot = await getDocs(q);
    const availableMatch = snapshot.docs.find(d => Object.keys(d.data().players).length < (d.data().maxPlayers || 2));

    if (availableMatch) {
        // Join it
        const playerEntry: VersusPlayer = {
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            teamId: player.teamId,
            score: 0,
            ready: false
        };
        await updateDoc(availableMatch.ref, { [`players.${player.id}`]: playerEntry });
        return availableMatch.id;
    } else {
        // Create new
        const randomGame = VERSUS_GAME_IDS[Math.floor(Math.random() * VERSUS_GAME_IDS.length)];
        const { matchId } = await createMatch(player, randomGame);
        return matchId;
    }
}
