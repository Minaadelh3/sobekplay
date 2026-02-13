import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminData } from '../../hooks/useAdminData';
import { TEAMS } from '../../types/auth'; // Fallback
import UserAvatar from '../UserAvatar';

// Firebase Imports for Quick Creation
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from '../../lib/firebase';

interface TeamDetailDrawerProps {
    team: any;
    onClose: () => void;
    onUpdate: (shouldClose?: boolean) => void;
}

export default function TeamDetailDrawer({ team, onClose, onUpdate }: TeamDetailDrawerProps) {
    const { updateTeamProfile, users, assignTeam } = useAdminData();

    // Derived Data
    const teamMembers = users.filter(u => u.teamId === team.id);
    const sortedMembers = [...teamMembers].sort((a, b) => (b.points || 0) - (a.points || 0));

    // Form State
    const [name, setName] = useState(team.name || '');
    const [avatar, setAvatar] = useState(team.avatar || '');
    const [color, setColor] = useState(team.color || '');
    const [pin, setPin] = useState(team.pin || '');
    const [loading, setLoading] = useState(false);

    // Quick Add State
    const [quickName, setQuickName] = useState('');
    const [quickEmail, setQuickEmail] = useState('');
    const [quickPassword, setQuickPassword] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [quickError, setQuickError] = useState<string | null>(null);

    const handleSave = async () => {
        setLoading(true);
        await updateTeamProfile(team.id, { name, avatar, color, pin });
        setLoading(false);
        onUpdate();
    };

    const handleRemoveMember = async (uid: string) => {
        if (!confirm("Remove this member from the team?")) return;
        await assignTeam(uid, ''); // Unassign
        onUpdate(false); // Refresh parent to get new user list if possible
    };

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setQuickError(null);
        setAddingMember(true);

        // Auto-generate credentials if missing
        const finalEmail = quickEmail || `minion_${Date.now()}_${Math.floor(Math.random() * 1000)}@sobek.com`;
        const finalPassword = quickPassword || pin || '123456'; // Fallback to team pin or 123456

        let secondaryApp: any = null;

        try {
            // 1. Initialize Secondary App (to not log out admin)
            secondaryApp = initializeApp(firebaseConfig, "SecondaryApp_QuickAdd_" + Date.now());
            const secondaryAuth = getAuth(secondaryApp);

            // 2. Create User
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, finalEmail, finalPassword);
            const newUser = userCred.user;

            // 3. Update Profile
            await updateProfile(newUser, {
                displayName: quickName,
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.uid}`
            });

            // 4. Create Firestore Doc
            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                email: finalEmail.toLowerCase(),
                name: quickName,
                displayName: quickName,
                photoURL: newUser.photoURL,
                teamId: team.id, // Assign immediately
                role: 'USER',
                points: 0,
                xp: 0,
                createdAt: serverTimestamp(),
                isOnboarded: true,
                isDisabled: false
            });

            // 5. Cleanup
            await signOut(secondaryAuth);
            await deleteApp(secondaryApp);

            // Success
            onUpdate(false); // Refresh cache (User list) but KEEP DRAWER OPEN
            setQuickName(''); // Clear Name for next entry
            setQuickEmail(''); // Clear Email
            setQuickPassword(''); // Clear Password
            // Keep focus on name input (handled by autoFocus potentially, or just user flow)

        } catch (err: any) {
            console.error("Quick Add Failed", err);
            setQuickError(err.message);
            if (secondaryApp) await deleteApp(secondaryApp);
        } finally {
            setAddingMember(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Slide-over Panel */}
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#141414] border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
                {/* Header with Color Banner */}
                <div className={`h-32 bg-gradient-to-r ${color || 'from-gray-800 to-black'} relative`}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 rounded-full p-2 backdrop-blur-sm z-20">✕</button>
                    <div className="absolute -bottom-8 left-6 flex items-end gap-4 z-10">
                        <div className="w-20 h-20 rounded-2xl bg-black shadow-xl ring-4 ring-[#141414] overflow-hidden">
                            <img src={avatar || '/assets/brand/logo.png'} className="w-full h-full object-cover" />
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-black text-white shadow-black drop-shadow-md">{name}</h2>
                            <span className="text-xs text-white/80 font-mono bg-black/30 px-2 py-0.5 rounded backdrop-blur-sm">{team.id}</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 pt-12 space-y-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#0F1218] p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Points</div>
                            <div className="text-xl font-bold text-accent-gold font-mono">{team.points?.toLocaleString() || 0}</div>
                        </div>
                        <div className="bg-[#0F1218] p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Members</div>
                            <div className="text-xl font-bold text-white font-mono">{teamMembers.length}</div>
                        </div>
                        <div className="bg-[#0F1218] p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Rank</div>
                            <div className="text-xl font-bold text-blue-400 font-mono">#{team.rank || '-'}</div>
                        </div>
                    </div>

                    {/* Quick Add Member Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-2">
                            <span>⚡</span> Quick Recruit Minion
                        </h3>
                        <form onSubmit={handleQuickAdd} className="bg-accent-gold/5 p-4 rounded-xl border border-accent-gold/20 space-y-3">
                            {quickError && (
                                <div className="text-red-400 text-xs p-2 bg-red-500/10 rounded border border-red-500/20">
                                    {quickError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <input
                                        required
                                        value={quickName}
                                        onChange={e => setQuickName(e.target.value)}
                                        placeholder="Minion Name (Required)"
                                        className="w-full bg-black/40 border border-accent-gold/30 rounded px-3 py-2 text-white placeholder-gray-600 focus:border-accent-gold outline-none"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="email"
                                        value={quickEmail}
                                        onChange={e => setQuickEmail(e.target.value)}
                                        placeholder="Override Email (Opt)"
                                        className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs placeholder-gray-600 focus:border-accent-gold outline-none"
                                        autoComplete="off"
                                    />
                                    <input
                                        type="text"
                                        value={quickPassword}
                                        onChange={e => setQuickPassword(e.target.value)}
                                        placeholder={`Pwd (Default: ${pin || '123456'})`}
                                        className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-xs placeholder-gray-600 focus:border-accent-gold outline-none font-mono"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={addingMember || !quickName}
                                className="w-full py-2.5 bg-accent-gold hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all shadow-lg shadow-accent-gold/10 disabled:opacity-50 active:scale-95"
                            >
                                {addingMember ? 'Summoning...' : 'Add Member & Keep Open'}
                            </button>
                            <p className="text-[9px] text-center text-gray-500">
                                Auto-generates email if blank. Default password is <b>{pin || '123456'}</b>.
                            </p>
                        </form>
                    </section>


                    {/* Settings Form */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <span>⚙️</span> Configuration
                        </h3>
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                                <input
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Color Gradient</label>
                                    <input
                                        value={color} onChange={e => setColor(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Avatar URL</label>
                                    <input
                                        value={avatar} onChange={e => setAvatar(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Team PIN/Password (Alphanumeric)</label>
                                <input
                                    value={pin} onChange={e => setPin(e.target.value)}
                                    placeholder="Default: 1234"
                                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white focus:border-accent-gold outline-none text-xs font-mono"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">This is the code users enter to select this profile.</p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Members List */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                            <div className="flex items-center gap-2"><span>👥</span> Team Roster</div>
                            <span className="text-[10px] text-gray-600">{teamMembers.length} active</span>
                        </h3>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {sortedMembers.map((member, idx) => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group border border-transparent hover:border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-mono w-4 text-center ${idx < 3 ? 'text-accent-gold' : 'text-gray-600'}`}>#{idx + 1}</span>
                                        <UserAvatar src={member.avatar || member.photoURL} name={member.name} size="sm" className="bg-gray-800" />
                                        <div>
                                            <div className="text-sm font-bold text-white">{member.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{member.points?.toLocaleString()} SP</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded text-xs transition-all"
                                        title="Remove from team"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </motion.div>
        </>
    );
}
