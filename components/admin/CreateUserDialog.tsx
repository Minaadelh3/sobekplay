import React, { useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from '../../lib/firebase';
import { TEAMS } from '../../types/auth';

interface CreateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserDialog({ isOpen, onClose, onSuccess }: CreateUserDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [role, setRole] = useState('USER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        let secondaryApp: any = null;

        try {
            // 1. Initialize a secondary app to avoid logging out the current admin
            secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
            const secondaryAuth = getAuth(secondaryApp);

            // 2. Create User in Auth
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCred.user;

            // 3. Update Profile (Display Name)
            await updateProfile(newUser, {
                displayName: name,
                photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + newUser.uid
            });

            // 4. Create User Document in Firestore (using PRIMARY db connection)
            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                email: newUser.email,
                name: name,
                displayName: name,
                photoURL: newUser.photoURL,
                teamId: teamId || null,
                role: role,
                points: 0,
                xp: 0,
                createdAt: serverTimestamp(),
                isOnboarded: true, // Assume admin-created users are onboarded
                isDisabled: false
            });

            // 5. Cleanup
            await signOut(secondaryAuth);

            // Success
            alert(`User ${name} created successfully!`);
            onSuccess();
            onClose();

        } catch (err: any) {
            console.error("Creation Failed", err);
            setError(err.message);
        } finally {
            if (secondaryApp) {
                await deleteApp(secondaryApp);
            }
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">New User Registration</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Name</label>
                            <input
                                required
                                value={name} onChange={e => setName(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold outline-none"
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Role</label>
                            <select
                                value={role} onChange={e => setRole(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold outline-none"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Email</label>
                        <input
                            type="email" required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold outline-none"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Password</label>
                        <input
                            type="text" required
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold outline-none font-mono"
                            placeholder="Strong Password"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Assign Team (Optional)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TEAMS.map(team => (
                                <button
                                    key={team.id}
                                    type="button"
                                    onClick={() => setTeamId(team.id === teamId ? '' : team.id)}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${teamId === team.id
                                            ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full hidden md:block`} style={{ backgroundColor: team.color?.includes('from-') ? '#888' : 'gray' }} />
                                    {team.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-bold bg-accent-gold text-black hover:bg-yellow-400 transition-colors shadow-lg shadow-accent-gold/20 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
