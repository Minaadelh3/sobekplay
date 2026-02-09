import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeamProfile, TEAMS } from '../types/auth';

export interface RankingMember {
    id: string;
    photoURL?: string;
    avatar?: string;
    name: string;
    role?: string;
    points?: number;
}

export interface RankedTeam extends TeamProfile {
    rank: number | null; // Null for non-scorable or admins
    displayRank?: string; // For UI (e.g. "1", "2", "-", "Admin")
}

export function useTeamRanking() {
    // DEBUG: Verify HMR
    console.log("🚀 useTeamRanking v3.1 (Avatars) loaded");

    const [sortedTeams, setSortedTeams] = useState<RankedTeam[]>([]);
    const [teamMembers, setTeamMembers] = useState<Record<string, RankingMember[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Raw Data State
    const [rawTeams, setRawTeams] = useState<TeamProfile[]>([]);
    const [rawUsers, setRawUsers] = useState<RankingMember[]>([]);
    const [teamsLoaded, setTeamsLoaded] = useState(false);
    const [usersLoaded, setUsersLoaded] = useState(false);

    // 1. Subscribe to Teams
    useEffect(() => {
        const qTeams = query(collection(db, "teams"));
        const unsub = onSnapshot(qTeams, (snap) => {
            const teams: TeamProfile[] = [];
            snap.forEach((doc) => teams.push(doc.data() as TeamProfile));
            setRawTeams(teams);
            setTeamsLoaded(true);
        }, (err) => {
            console.error("Teams fetch error", err);
            setError("Failed to load teams");
        });
        return () => unsub();
    }, []);

    // 2. Subscribe to Users
    useEffect(() => {
        const qUsers = query(collection(db, "users"));
        const unsub = onSnapshot(qUsers, (snap) => {
            const users: RankingMember[] = [];
            snap.forEach((doc) => {
                const d = doc.data();

                // Resolve Avatar
                let finalAvatar = d.profile?.photoURL || d.avatar || d.photoURL;
                if (!finalAvatar && d.teamId) {
                    const team = TEAMS.find(t => t.id === d.teamId);
                    if (team) finalAvatar = team.avatar;
                }

                users.push({
                    id: doc.id,
                    name: d.name || d.displayName || "Unknown",
                    avatar: finalAvatar,
                    role: d.role,
                    points: d.scoreTotal || d.xp || d.points || 0,
                    scoreTotal: d.scoreTotal || 0,
                    teamId: d.teamId
                } as any);
            });
            setRawUsers(users);
            setUsersLoaded(true);
        }, (err) => {
            console.error("Users fetch error", err);
        });
        return () => unsub();
    }, []);

    // 3. Aggregate & Calculate
    useEffect(() => {
        if (!teamsLoaded || !usersLoaded) return;

        // --- AGGREGATION LOGIC ---
        const teamPointsMap: Record<string, number> = {};
        const membersMap: Record<string, RankingMember[]> = {};

        // Initialize maps
        rawTeams.forEach(t => {
            teamPointsMap[t.id] = 0;
            membersMap[t.id] = [];
        });

        // Distribute Users & Sum Points
        rawUsers.forEach(u => {
            // Strict Admin Exclusion from Team Points
            if (u.role === 'ADMIN' || u.role === 'admin') return;

            // Allow user to be in a team map even if strict typing of u.teamId is missing in interface (cast as any if needed)
            const tid = (u as any).teamId;
            if (tid && teamPointsMap[tid] !== undefined) {
                teamPointsMap[tid] += (u.points || 0);
                membersMap[tid].push(u);
            }
        });

        // Sort members within teams
        Object.keys(membersMap).forEach(tid => {
            membersMap[tid].sort((a, b) => (b.points || 0) - (a.points || 0));
        });

        // --- RANKING LOGIC ---
        const scorable = rawTeams.filter(t => t.isScorable !== false && t.id !== 'uncle_joy');
        const nonScorable = rawTeams.filter(t => t.isScorable === false || t.id === 'uncle_joy');

        // Apply calculated points
        const calculatedScorable = scorable.map(t => ({
            ...t,
            points: teamPointsMap[t.id] // Override DB points with Sum
        }));

        // Sort Teams
        calculatedScorable.sort((a, b) => {
            const pointsDiff = (b.points || 0) - (a.points || 0);
            if (pointsDiff !== 0) return pointsDiff;
            return (a.name || '').localeCompare(b.name || '');
        });

        // Assign Ranks
        const rankedScorable: RankedTeam[] = [];
        for (let i = 0; i < calculatedScorable.length; i++) {
            const team = calculatedScorable[i];
            let rank = i + 1;

            // Tie handling (Competition Rank: 1, 2, 2, 4)
            if (i > 0) {
                const prev = rankedScorable[i - 1];
                if (prev.points === team.points) {
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
            points: teamPointsMap[t.id] || 0,
            rank: null,
            displayRank: null
        }));

        // Filter out 'uncle_joy' (Admin Team) from public view
        const visibleNonScorable = processedNonScorable.filter(t => t.id !== 'uncle_joy');

        setSortedTeams([...rankedScorable, ...visibleNonScorable]);
        setTeamMembers(membersMap);
        setLoading(false);

    }, [rawTeams, rawUsers, teamsLoaded, usersLoaded]);

    return { sortedTeams, teamMembers, loading, error };
}
