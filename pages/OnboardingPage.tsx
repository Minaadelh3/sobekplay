import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AVATARS = [
    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
    "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg",
    "https://img.freepik.com/free-psd/3d-illustration-business-man-with-glasses_23-2149436194.jpg",
    "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436190.jpg",
    "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436191.jpg",
];

export default function OnboardingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [nickname, setNickname] = useState(''); // "Sobek King"
    const [displayName, setDisplayName] = useState(user?.displayName || ''); // "Mina Adel"
    const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || AVATARS[0]);

    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!nickname.trim() || !displayName.trim()) return alert("Please fill all fields");

        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.id);

            await updateDoc(userRef, {
                displayName: displayName.trim(),
                nickname: nickname.trim(),
                avatarURL: selectedAvatar,
                isOnboarded: true,
                onboardedAt: serverTimestamp(),
            });

            // Force reload or navigate
            navigate('/profiles', { replace: true });

        } catch (error: any) {
            console.error("Onboarding failed:", error);
            alert("Error saving profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4 font-sans text-white">
            <div className="w-full max-w-md bg-[#161616] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-gold/20 blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-bold text-accent-gold mb-2">Welcome to Sobek!</h1>
                    <p className="text-gray-400 text-sm mb-8">Let's set up your profile quickly.</p>

                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Avatar Selection */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-300">Choose your Avatar</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                                {AVATARS.map((url) => (
                                    <button
                                        key={url}
                                        type="button"
                                        onClick={() => setSelectedAvatar(url)}
                                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === url ? 'border-accent-gold scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt="avatar" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Display Name */}
                        <div className="text-left space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-accent-gold outline-none transition-colors text-white"
                                placeholder="e.g. Mina Adel"
                            />
                        </div>

                        {/* Nickname */}
                        <div className="text-left space-y-1">
                            <label className="text-xs text-gray-400 ml-1">Nickname (In Chat)</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-accent-gold outline-none transition-colors text-white"
                                placeholder="e.g. Sobek King 👑"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all active:scale-95 mt-4"
                        >
                            {loading ? "Setting up..." : "Start Journey 🚀"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
