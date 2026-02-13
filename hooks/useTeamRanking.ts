import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeamProfile } from '../types/auth';

export interface RankedTeam extends TeamProfile {
    rank: number | null; // Null for non-scorable or admins
    displayRank?: string; // For UI (e.g. "1", "2", "-", "Admin")
}

export function useTeamRanking() {
    // DEBUG: Verify HMR
    console.log("🚀 useTeamRanking v4.0 (Optimized) loaded");

    const [sortedTeams, setSortedTeams] = useState<RankedTeam[]>([]);
    const [teamMembers, setTeamMembers] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Subscribe to Teams & Users
    useEffect(() => {
        // Teams Query
        const qTeams = query(collection(db, "teams"));

        // Users Query (Fetch all users to map them to teams - optimized for Avatar display)
        const qUsers = query(collection(db, "users"));

        // Subscribe to Teams
        const unsubTeams = onSnapshot(qTeams, (snap) => {
            const teams: TeamProfile[] = [];
            snap.forEach((doc) => teams.push(doc.data() as TeamProfile));

            // --- RANKING LOGIC ---
            const scorable = teams.filter(t => t.isScorable !== false && t.id !== 'uncle_joy');
            const nonScorable = teams.filter(t => t.isScorable === false || t.id === 'uncle_joy');

            // Sort
            scorable.sort((a, b) => {
                const pointsDiff = (b.scoreTotal || 0) - (a.scoreTotal || 0);
                if (pointsDiff !== 0) return pointsDiff;
                return (a.name || '').localeCompare(b.name || '');
            });

            // Assign Ranks
            const rankedScorable: RankedTeam[] = [];
            for (let i = 0; i < scorable.length; i++) {
                const team = scorable[i];
                let rank = i + 1;
                if (i > 0) {
                    const prev = rankedScorable[i - 1];
                    if ((prev.scoreTotal || 0) === (team.scoreTotal || 0)) {
                        rank = prev.rank!;
                    }
                }
                rankedScorable.push({ ...team, rank, displayRank: rank.toString() });
            }

            // Non-Scorable
            const visibleNonScorable = nonScorable
                .filter(t => t.id !== 'uncle_joy')
                .map(t => ({ ...t, rank: null, displayRank: null }));

            setSortedTeams([...rankedScorable, ...visibleNonScorable]);
            setLoading(false);
        }, (err) => {
            console.error("Teams fetch error", err);
            setError("Failed to load teams");
            setLoading(false);
        });

        // Subscribe to Users (for Member Avatars)
        const unsubUsers = onSnapshot(qUsers, (snap) => {
            const membersMap: Record<string, any[]> = {};

            snap.forEach(doc => {
                const u = doc.data();
                if (u.teamId) {
                    if (!membersMap[u.teamId]) membersMap[u.teamId] = [];
                    membersMap[u.teamId].push({
                        id: doc.id,
                        name: u.displayName || u.name,
                        avatar: u.profile?.photoURL || u.photoURL || u.avatar,
                        points: u.points || 0
                    });
                }
            });

            setTeamMembers(membersMap);
        });

        return () => {
            unsubTeams();
            unsubUsers();
        };
    }, []);

    return { sortedTeams, teamMembers, loading, error };
}
