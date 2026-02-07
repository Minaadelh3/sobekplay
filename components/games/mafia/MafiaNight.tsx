import React, { useState } from 'react';
import { Player, Role } from '../../../hooks/gamification/useMafiaGame';

interface MafiaNightProps {
    phase: 'NIGHT_MAFIA' | 'NIGHT_DOCTOR' | 'NIGHT_DETECTIVE';
    players: Player[];
    onAction: (targetId: string | null) => void;
}

const MafiaNight: React.FC<MafiaNightProps> = ({ phase, players, onAction }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Filter valid targets (must be alive)
    const alivePlayers = players.filter(p => p.isAlive);

    // Config based on phase
    const config = {
        'NIGHT_MAFIA': {
            title: "المافيا تختار..",
            subtitle: "مين لازم يختفي الليلة؟ 😈",
            action: "اقتل 🔫",
            color: "text-red-600",
            bg: "bg-red-900/20"
        },
        'NIGHT_DOCTOR': {
            title: "الدكتور يصحى..",
            subtitle: "مين محتاج إنقاذ؟ 🚑",
            action: "أنقذ 💉",
            color: "text-green-400",
            bg: "bg-green-900/20"
        },
        'NIGHT_DETECTIVE': {
            title: "المحقق يشوف..",
            subtitle: "شاكك في مين؟ 🕵️",
            action: "اكشف 🔍",
            color: "text-yellow-400",
            bg: "bg-yellow-900/20"
        }
    }[phase];

    const handleConfirm = () => {
        if (selectedId || phase !== 'NIGHT_MAFIA') { // Mafia MUST kill? Usually yes. Doc/Det can skip? Maybe.
            // For simplicity, let's enforce selection for Mafia, optional for others? 
            // Logic in hook handles null for Doc/Det.
            if (phase === 'NIGHT_MAFIA' && !selectedId) return;
            onAction(selectedId);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 text-center">

            {/* Header */}
            <div className={`py-6 rounded-3xl mb-8 border border-white/5 ${config.bg}`}>
                <h2 className={`text-4xl font-black ${config.color} mb-2`}>{config.title}</h2>
                <p className="text-gray-300 font-bold">{config.subtitle}</p>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pb-20">
                {alivePlayers.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)}
                        className={`
                            p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2
                            ${selectedId === p.id
                                ? `border-${config.color.split('-')[1]}-500 bg-white/10 scale-105`
                                : 'border-white/5 bg-[#151921] opacity-70 hover:opacity-100'}
                        `}
                    >
                        <div className="text-3xl">👤</div>
                        <div className="font-bold text-sm truncate w-full">{p.name}</div>
                    </button>
                ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4">
                {phase !== 'NIGHT_MAFIA' && (
                    <button
                        onClick={() => onAction(null)}
                        className="w-full mb-3 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold text-sm"
                    >
                        Skip Action (No one)
                    </button>
                )}

                <button
                    onClick={handleConfirm}
                    disabled={phase === 'NIGHT_MAFIA' && !selectedId}
                    className={`
                        w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-lg transition-all
                        ${phase === 'NIGHT_MAFIA' && !selectedId ? 'bg-gray-800 text-gray-500' : 'bg-white text-black hover:scale-[1.02]'}
                    `}
                >
                    {config.action} {selectedId ? `(${alivePlayers.find(p => p.id === selectedId)?.name})` : ''}
                </button>
            </div>
        </div>
    );
};

export default MafiaNight;
