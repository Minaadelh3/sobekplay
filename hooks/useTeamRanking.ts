import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TeamProfile } from '../types/auth';

export interface RankingMember {
    id: string;
    photoURL?: string;
    avatar?: string;
    name: string;
    role?: string;
}

export function useTeamRanking() {
    const [sortedTeams, setSortedTeams] = useState<TeamProfile[]>([]);
    const [teamMembers, setTeamMembers] = useState<Record<string, RankingMember[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        // We fetch all teams. We can't strictly order by points in the query 
        // because Uncle Joy might have 0 or undefined points and we want specific placement.
        // It's safer to fetch all and sort in client for this specific hybrid logic.
        const qTeams = query(collection(db, "teams"));
        const qUsers = query(collection(db, "users")); // Fetch all users for avatars

        // Parallel listeners
        const unsubTeams = onSnapshot(qTeams, (snap) => {
            const teams: TeamProfile[] = [];
            snap.forEach((doc) => teams.push(doc.data() as TeamProfile));

            // Hybrid Sort
            const scorable = teams.filter(t => t.isScorable !== false && t.id !== 'uncle_joy');
            const nonScorable = teams.filter(t => t.isScorable === false || t.id === 'uncle_joy');
            scorable.sort((a, b) => (b.points || 0) - (a.points || 0));
            setSortedTeams([...scorable, ...nonScorable]);
            setLoading(false);
        }, (err) => {
            console.error("Teams fetch error", err);
            setError("Failed to load teams");
        });

        const unsubUsers = onSnapshot(qUsers, (snap) => {
            const membersMap: Record<string, RankingMember[]> = {};

            snap.forEach((doc) => {
                const u = doc.data();
                // CRITICAL RULE: Exclude Admins from Ranking/Home Visuals
                if (u.role === 'ADMIN') return;

                if (u.teamId) {
                    if (!membersMap[u.teamId]) membersMap[u.teamId] = [];
                    membersMap[u.teamId].push({
                        id: doc.id,
                        name: u.name || u.displayName,
                        avatar: u.avatar || u.photoURL, // Fallback handled in UI
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
