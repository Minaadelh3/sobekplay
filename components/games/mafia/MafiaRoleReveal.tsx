import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Role } from '../../../hooks/gamification/useMafiaGame';

interface MafiaRoleRevealProps {
    player: Player;
    onNext: () => void;
}

const MafiaRoleReveal: React.FC<MafiaRoleRevealProps> = ({ player, onNext }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = () => setIsRevealed(true);
    const handleHide = () => {
        setIsRevealed(false);
        onNext();
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <AnimatePresence mode="wait">
                {!isRevealed ? (
                    <motion.div
                        key="pass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-8"
                    >
                        <div className="text-6xl animate-bounce">📱</div>
                        <h2 className="text-3xl font-black text-white">
                            إدي الموبايل لـ <br />
                            <span className="text-accent-gold block mt-4 text-5xl">{player.name}</span>
                        </h2>
                        <p className="text-gray-500 font-bold">ممنوع تبص على غيرك 😈</p>

                        <button
                            onClick={handleReveal}
                            className="bg-white/10 border border-white/20 text-white font-bold py-4 px-12 rounded-2xl hover:bg-white/20 transition-all mt-8"
                        >
                            أنا {player.name} (Show Role)
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, rotateX: 90 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: -90 }}
                        className="w-full max-w-sm"
                    >
                        <RoleCard role={player.role} />

                        <button
                            onClick={handleHide}
                            className="w-full bg-black border border-white/20 text-white font-bold py-6 rounded-2xl mt-8 hover:bg-white/10 transition-all uppercase tracking-widest"
                        >
                            خبي بسرعة 🙈
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RoleCard = ({ role }: { role: Role }) => {
    const config = {
        MAFIA: { icon: '😈', title: 'MAFIA', color: 'text-red-600', desc: 'إنت من المافيا.. شد حيلك ومتبانش 😏' },
        VILLAGER: { icon: '🧑', title: 'VILLAGER', color: 'text-blue-400', desc: 'إنت راجل غلبان.. بس دماغك هي سلاحنا 🧠' },
        DOCTOR: { icon: '👨‍⚕️', title: 'DOCTOR', color: 'text-green-400', desc: 'إيدك فيها الشفاء.. اختار صح وأنقذ الناس 👀' },
        DETECTIVE: { icon: '🕵️', title: 'DETECTIVE', color: 'text-yellow-400', desc: 'عينك على الكل.. اكشف المستور بس بحذر 👁️' },
    }[role];

    return (
        <div className="bg-[#151921] border border-white/10 rounded-3xl p-10 shadow-2xl space-y-6">
            <div className="text-8xl">{config.icon}</div>
            <h2 className={`text-4xl font-black ${config.color} tracking-wider`}>{config.title}</h2>
            <p className="text-white text-xl font-medium leading-relaxed">{config.desc}</p>
        </div>
    );
};

export default MafiaRoleReveal;
