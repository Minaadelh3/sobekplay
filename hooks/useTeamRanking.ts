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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Subscribe to Teams (Client-side sorting fallback for missing fields)
    useEffect(() => {
        // Query: Fetch ALL teams (safer for small count, guarantees no missing docs due to missing sort field)
        const qTeams = query(collection(db, "teams"));

        const unsub = onSnapshot(qTeams, (snap) => {
            const teams: TeamProfile[] = [];
            snap.forEach((doc) => teams.push(doc.data() as TeamProfile));

            // --- RANKING LOGIC ---
            const scorable = teams.filter(t => t.isScorable !== false && t.id !== 'uncle_joy');
            const nonScorable = teams.filter(t => t.isScorable === false || t.id === 'uncle_joy');

            // Teams are already sorted by scoreTotal from Firestore mostly,
            // but we ensure consistent tie-breaking here.
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

                // Tie handling (Competition Rank: 1, 2, 2, 4)
                if (i > 0) {
                    const prev = rankedScorable[i - 1];
                    if ((prev.scoreTotal || 0) === (team.scoreTotal || 0)) {
                        rank = prev.rank!;
                    }
                }

                rankedScorable.push({
                    ...team,
                    rank: rank,
                    displayRank: rank.toString()
                });
            }

            // Process Non-Scorable
            const processedNonScorable: RankedTeam[] = nonScorable.map(t => ({
                ...t,
                rank: null,
                displayRank: null
            }));

            // Filter out 'uncle_joy' (Admin Team) from public view
            const visibleNonScorable = processedNonScorable.filter(t => t.id !== 'uncle_joy');

            setSortedTeams([...rankedScorable, ...visibleNonScorable]);
            setLoading(false);
        }, (err) => {
            console.error("Teams fetch error", err);
            setError("Failed to load teams");
            setLoading(false);
        });
        return () => unsub();
    }, []);

    return { sortedTeams, loading, error };
}
