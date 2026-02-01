import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeamProfile } from '../types/auth';

export interface RankingMember {
    id: string;
    photoURL?: string;
    avatar?: string;
    name: string;
    role?: string;
}

export interface RankedTeam extends TeamProfile {
    rank: number | null; // Null for non-scorable or admins
    displayRank?: string; // For UI (e.g. "1", "2", "-", "Admin")
}

export function useTeamRanking() {
    const [sortedTeams, setSortedTeams] = useState<RankedTeam[]>([]);
    const [teamMembers, setTeamMembers] = useState<Record<string, RankingMember[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const qTeams = query(collection(db, "teams"));
        const qUsers = query(collection(db, "users"));

        const unsubTeams = onSnapshot(qTeams, (snap) => {
            const teams: TeamProfile[] = [];
            snap.forEach((doc) => teams.push(doc.data() as TeamProfile));

            // Separation Logic
            const scorable = teams.filter(t => t.isScorable !== false && t.id !== 'uncle_joy');
            const nonScorable = teams.filter(t => t.isScorable === false || t.id === 'uncle_joy');

            // Sort Scorable by Points (Desc), then by Name (Asc) for stability
            scorable.sort((a, b) => {
                const pointsDiff = (b.points || 0) - (a.points || 0);
                if (pointsDiff !== 0) return pointsDiff;
                return a.name.localeCompare(b.name);
            });

            // Assign Ranks with Tie Handling
            const rankedScorable: RankedTeam[] = [];

            for (let i = 0; i < scorable.length; i++) {
                const team = scorable[i];
                const prevTeam = i > 0 ? scorable[i - 1] : null;

                // If points tie with previous, share rank
                if (prevTeam && (team.points || 0) === (prevTeam.points || 0)) {
                    rankedScorable.push({
                        ...team,
                        rank: rankedScorable[i - 1].rank,
                        displayRank: rankedScorable[i - 1].displayRank
                    });
                } else {
                    // Standard competition ranking: 1, 2, 2, 4... is technically correct but users often prefer 1, 2, 2, 3 in casual contexts.
                    // User Request says "ties in points" handling. 
                    // Let's stick to standard 1, 2, 2, 4 for accuracy in "ranking" or 1, 2, 2, 3 for dense rank?
                    // Typically 'rank' is the row index + 1, skipping for ties. 
                    // But visually simple: Current index + 1 is easiest explanation.
                    // Actually, let's do: 1, 2, 2, 4 (Standard Competition Ranking)
                    rankedScorable.push({
                        ...team,
                        rank: i + 1,
                        displayRank: (i + 1).toString()
                    });
                }
            }

            // Process Non-Scorable
            const processedNonScorable: RankedTeam[] = nonScorable.map(t => ({
                ...t,
                rank: null,
                displayRank: null
            }));

            // Final Combined List: Scorable first, then Non-Scorable
            setSortedTeams([...rankedScorable, ...processedNonScorable]);
            setLoading(false);
        }, (err) => {
            console.error("Teams fetch error", err);
            setError("Failed to load teams");
        });

        const unsubUsers = onSnapshot(qUsers, (snap) => {
            const membersMap: Record<string, RankingMember[]> = {};

            snap.forEach((doc) => {
                const u = doc.data();
                if (u.role === 'ADMIN') return; // Exclude Admins

                if (u.teamId) {
                    if (!membersMap[u.teamId]) membersMap[u.teamId] = [];
                    membersMap[u.teamId].push({
                        id: doc.id,
                        name: u.name || u.displayName,
                        avatar: u.avatar || u.photoURL,
                        photoURL: u.avatar || u.photoURL
                    });
                }
            });
            setTeamMembers(membersMap);
        }, (err) => {
            console.error("Users fetch error", err);
        });

        return () => {
            unsubTeams();
            unsubUsers();
        };
    }, []);

    return { sortedTeams, teamMembers, loading, error };
}
