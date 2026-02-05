import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';

const FLAGS_DOC_ID = 'feature_flags';

const DEFAULT_FLAGS = {
    maintenance_mode: false,
    enable_registrations: true,
    enable_chat: true,
    enable_game_submissions: true,
    beta_features: false
};

export default function FeatureFlagsManager() {
    const [flags, setFlags] = useState<any>(DEFAULT_FLAGS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const ref = doc(db, 'system_config', FLAGS_DOC_ID);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setFlags({ ...DEFAULT_FLAGS, ...snap.data() });
            } else {
                // Initialize if not exists
                await setDoc(ref, DEFAULT_FLAGS);
            }
        } catch (e) {
            console.error("Failed to fetch flags", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (key: string) => {
        const newValue = !flags[key];
        setFlags((prev: any) => ({ ...prev, [key]: newValue })); // Optimistic update

        try {
            const ref = doc(db, 'system_config', FLAGS_DOC_ID);
            await updateDoc(ref, { [key]: newValue });
        } catch (e) {
            console.error("Failed to update flag", e);
            setFlags((prev: any) => ({ ...prev, [key]: !newValue })); // Revert
            alert("Failed to update flag.");
        }
    };

    const definitions = [
        { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Lock the entire application for all non-admin users.', danger: true },
        { key: 'enable_registrations', label: 'User Registration', desc: 'Allow new users to sign up via Google/Email.' },
        { key: 'enable_chat', label: 'Global Chat', desc: 'Enable the global/team chat system.' },
        { key: 'enable_game_submissions', label: 'Game Submissions', desc: 'Allow users to submit new game scores.' },
        { key: 'beta_features', label: 'Beta Features', desc: 'Unlock experimental features for Beta testers.' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>🧪</span> Feature Flags
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time system toggles. Changes propagate immediately.</p>
                </div>

                <div className="space-y-4">
                    {definitions.map((def) => {
                        const isOn = flags[def.key];
                        return (
                            <div key={def.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isOn ? 'bg-white/[0.02] border-white/10' : 'bg-[#0A0C10] border-transparent opacity-80'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${def.danger ? 'text-red-400' : 'text-white'}`}>{def.label}</h3>
                                        {def.danger && <span className="text-[9px] bg-red-900/30 text-red-500 px-1.5 rounded border border-red-900/50">DANGER</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{def.desc}</p>
                                </div>

                                <button
                                    onClick={() => toggleFlag(def.key)}
                                    className={`relative w-14 h-7 rounded-full transition-colors flex items-center px-1 ${isOn ? (def.danger ? 'bg-red-600' : 'bg-green-600') : 'bg-gray-700'}`}
                                >
                                    <motion.div
                                        layout
                                        className="w-5 h-5 bg-white rounded-full shadow-md"
                                        animate={{ x: isOn ? 28 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
