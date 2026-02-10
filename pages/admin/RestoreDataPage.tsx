import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { TEAMS } from '../../types/auth'; // Source of Truth for Default Teams

export default function RestoreDataPage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const makeMeAdmin = async () => {
        if (!auth.currentUser) return setStatus("Not Logged In");
        setLoading(true);
        try {
            const uid = auth.currentUser.uid;
            await updateDoc(doc(db, "users", uid), {
                role: 'ADMIN',
                teamId: 'uncle_joy'
            });
            setStatus("✅ You are now an ADMIN. Refresh the page.");
        } catch (e: any) {
            setStatus("❌ Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const seedTeams = async () => {
        setLoading(true);
        setStatus("🌱 Seeding Teams...");
        try {
            for (const team of TEAMS) {
                const teamRef = doc(db, "teams", team.id);
                const snap = await getDoc(teamRef);

                if (!snap.exists()) {
                    await setDoc(teamRef, {
                        ...team,
                        points: 0,
                        scoreTotal: 0,
                        createdAt: serverTimestamp(),
                        isScorable: team.id !== 'uncle_joy'
                    });
                    console.log(`Created Team: ${team.name}`);
                } else {
                    // Optional: Force Update if things are broken
                    await updateDoc(teamRef, {
                        ...team,
                        // Don't reset points here to avoid accidents, mostly metadata
                        isScorable: team.id !== 'uncle_joy'
                    });
                    console.log(`Updated Team: ${team.name}`);
                }
            }
            setStatus("✅ Teams Seeded Successfully!");
        } catch (e: any) {
            setStatus("❌ Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold text-red-500">🚨 EMERGENCY RESTORE</h1>

            <div className="bg-white/10 p-6 rounded-xl border border-red-500/30 max-w-md w-full text-center">
                <p className="mb-4 text-gray-300">
                    Logged in as: <span className="font-bold text-white">{user?.email || auth.currentUser?.email || 'Guest'}</span>
                </p>
                <div className="grid gap-4">
                    <button
                        onClick={makeMeAdmin}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        👑 MAKE ME ADMIN
                    </button>

                    <button
                        onClick={seedTeams}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        🌱 RESTORE TEAMS DATA
                    </button>
                    <button
                        onClick={() => logout()}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        LOGOUT
                    </button>
                </div>

                {status && (
                    <div className="mt-6 p-4 bg-black rounded-lg border border-white/20 font-mono text-sm">
                        {status}
                    </div>
                )}
            </div>

            <a href="/app/home" className="text-gray-500 hover:text-white underline">Back to App</a>
        </div>
    );
}
