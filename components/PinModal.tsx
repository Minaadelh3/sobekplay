import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamProfile } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PinModalProps {
    team: TeamProfile;
    onClose: () => void;
}

export default function PinModal({ team, onClose }: PinModalProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { selectTeam } = useAuth();
    const navigate = useNavigate();

    // Auto-focus input
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin) return;

        const success = await selectTeam(team.id, pin);
        if (success) {
            navigate('/app/home');
        } else {
            setError(true);
            setPin('');
            inputRef.current?.focus();
            // Reset error after animation
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4" dir="rtl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    x: error ? [0, -10, 10, -10, 10, 0] : 0
                }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0B0F14] border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden"
            >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-gold/10 blur-3xl rounded-full" />

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
                >
                    &times;
                </button>

                <div className="text-center mb-8 relative z-10">
                    <p className="text-accent-gold text-[10px] uppercase tracking-[0.2em] font-black mb-3 opacity-80">الفريق المختار</p>
                    <h2 className="text-3xl font-black text-white mb-6 tracking-tight">{team.name}</h2>

                    <div className="h-1 w-12 bg-accent-gold/30 mx-auto rounded-full mb-8" />

                    <p className="text-gray-300 text-lg font-medium">
                        اكتب كود الدخول
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                        ده الكود الخاص بالفريق (حروف أو أرقام)<br />
                        تأكد من كتابته بشكل صحيح
                    </p>

                    {team.passwordHint && (
                        <div className="mt-4 py-2 px-3 bg-accent-gold/10 rounded-lg border border-accent-gold/20 inline-block">
                            <p className="text-accent-gold text-xs font-bold">
                                💡 تلميح: {team.passwordHint}
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="relative mb-6">
                        <input
                            ref={inputRef}
                            type="password"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value);
                                if (error) setError(false);
                            }}
                            placeholder="••••••••"
                            className={`
                                w-full bg-black/50 border-2 rounded-2xl py-4 px-6 text-center text-2xl font-bold text-white
                                focus:outline-none focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10
                                placeholder:text-gray-800 tracking-[0.3em]
                                transition-all duration-300
                                ${error ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10'}
                            `}
                        />

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-center text-xs mt-3 font-bold"
                            >
                                الرمز غير صحيح، حاول مرة تانية 🚫
                            </motion.p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!pin}
                        className="w-full bg-accent-gold hover:bg-gold-light text-black font-black py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                    >
                        دخول للفريق
                    </button>
                </form>

                <div className="mt-8 text-center opacity-40">
                    <img src="/assets/brand/logo.png" alt="Sobek" className="h-6 mx-auto grayscale brightness-200" />
                </div>
            </motion.div>
        </div>
    );
}
