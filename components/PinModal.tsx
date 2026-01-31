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
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { selectTeam } = useAuth();
    const navigate = useNavigate();

    // Auto-focus first input
    useEffect(() => {
        // Only focus if the modal is considered "open" or rendered
        // The previous version had an `isOpen` prop, which is now implicitly handled by rendering the component.
        // If this component is always mounted, this useEffect would fire only once.
        // If it's conditionally mounted, it will fire on mount.
        // Adding a small delay to ensure the input is rendered and focusable.
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError(false);

        // Auto-advance
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check PIN when full
        if (newPin.every(d => d !== '')) {
            handleComplete(newPin.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleComplete = async (fullPin: string) => {
        const success = await selectTeam(team.id, fullPin);
        if (success) {
            navigate('/app/home');
        } else {
            setError(true);
            // Shake effect handled by Framer Motion on the container
            setPin(['', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md" dir="rtl">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: error ? [0, -10, 10, -10, 10, 0] : 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0B0F14] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors text-2xl"
                >
                    &times;
                </button>

                <div className="text-center mb-8">
                    <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">تسجيل الدخول كـ</p>
                    <h2 className="text-2xl font-bold text-white mb-6 animate-pulse">{team.name}</h2>
                    <p className="text-accent-gold text-lg font-medium">
                        اكتب كود الفريق (4 أرقام)
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        ده كود الفريق، مش كلمة سر الحساب
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {pin.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className={`
                                w-12 h-14 bg-black/50 border-2 rounded-lg text-center text-2xl font-bold text-white
                                focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold
                                transition-all
                                ${error ? 'border-red-500' : 'border-white/20'}
                            `}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-center text-sm animate-pulse font-bold">
                        الرمز غلط، جرب تاني 🚫
                    </p>
                )}
            </motion.div>
        </div>
    );
}
