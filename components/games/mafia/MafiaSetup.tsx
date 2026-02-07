import React from 'react';
import { motion } from 'framer-motion';
import { GameSettings } from '../../../hooks/gamification/useMafiaGame';

interface MafiaSetupProps {
    settings: GameSettings;
    onUpdate: (settings: Partial<GameSettings>) => void;
    onStart: () => void;
}

const MafiaSetup: React.FC<MafiaSetupProps> = ({ settings, onUpdate, onStart }) => {
    return (
        <div className="flex flex-col h-full justify-center space-y-8 p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-5xl font-black text-white drop-shadow-lg tracking-tighter">
                    MAFIA <span className="text-red-600 block text-3xl mt-2 tracking-widest">PARTY MODE 🕶️</span>
                </h1>
                <p className="text-gray-400 text-lg font-medium">شد الكراسي.. اللعبة هتبدأ 👀</p>
            </motion.div>

            {/* Player Count */}
            <div className="bg-[#1A1D24] p-6 rounded-3xl border border-white/5 space-y-4">
                <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs">عدد اللاعيبة</label>
                <div className="flex items-center justify-between bg-black/40 rounded-2xl p-2 border border-white/10">
                    <button
                        onClick={() => onUpdate({ playerCount: Math.max(4, settings.playerCount - 1) })}
                        className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl font-black text-white hover:bg-white/10 active:scale-95 transition-all"
                    >
                        -
                    </button>
                    <div className="font-black text-4xl text-accent-gold tabular-nums">
                        {settings.playerCount}
                    </div>
                    <button
                        onClick={() => onUpdate({ playerCount: Math.min(20, settings.playerCount + 1) })}
                        className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl font-black text-white hover:bg-white/10 active:scale-95 transition-all"
                    >
                        +
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    {Math.floor(settings.playerCount / 4)} Mafia • {settings.playerCount - Math.floor(settings.playerCount / 4) - (settings.hasDoctor ? 1 : 0) - (settings.hasDetective ? 1 : 0)} Villagers
                </p>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
                <Toggle
                    label="Doctor 👨‍⚕️"
                    desc="بيحمي حد بالليل"
                    active={settings.hasDoctor}
                    onToggle={() => onUpdate({ hasDoctor: !settings.hasDoctor })}
                />
                <Toggle
                    label="Detective 🕵️"
                    desc="بيكشف المافيا"
                    active={settings.hasDetective}
                    onToggle={() => onUpdate({ hasDetective: !settings.hasDetective })}
                />
            </div>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="bg-accent-gold text-black text-xl font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider w-full mt-4"
            >
                Start Game ▶
            </button>
        </div>
    );
};

const Toggle = ({ label, desc, active, onToggle }: { label: string, desc: string, active: boolean, onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`p-4 rounded-2xl border transition-all text-left ${active ? 'bg-green-500/10 border-green-500/50' : 'bg-[#1A1D24] border-white/5 opacity-60 hover:opacity-100'}`}
    >
        <div className={`font-bold text-lg mb-1 ${active ? 'text-green-400' : 'text-gray-400'}`}>{label}</div>
        <div className="text-[10px] text-gray-500 leading-tight">{desc}</div>
    </button>
);

export default MafiaSetup;
