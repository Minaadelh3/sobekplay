import React, { useState, useEffect, useMemo } from 'react';
import { Player } from '../../../hooks/gamification/useMafiaGame';
import { getRandomHumor } from '../../../lib/mafiaContent';

interface MafiaDayProps {
    phase: 'MORNING_REVEAL' | 'DISCUSSION' | 'VOTING' | 'ELIMINATION_REVEAL' | 'GAME_OVER';
    players: Player[];
    lastEliminated: Player | null;
    winner: 'MAFIA' | 'VILLAGERS' | null;
    onNext: () => void;
    onVote: (targetId: string | null) => void;
    onReset: () => void;
}

const MafiaDay: React.FC<MafiaDayProps> = ({
    phase, players, lastEliminated, winner,
    onNext, onVote, onReset
}) => {

    // Memoize quotes to prevent flickering
    const eliminationQuote = useMemo(() => lastEliminated ? getRandomHumor('elimination') : '', [lastEliminated]);
    const votingQuote = useMemo(() => getRandomHumor('voting'), []);
    const winQuote = useMemo(() => winner ? getRandomHumor(winner === 'MAFIA' ? 'mafiaWin' : 'villagerWin') : '', [winner]);

    // --- Morning Reveal ---
    if (phase === 'MORNING_REVEAL') {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-6">
                <div className="text-6xl animate-pulse">☀️</div>
                <h2 className="text-4xl font-black text-white">صباح الخير</h2>

                {lastEliminated ? (
                    <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/30">
                        <p className="text-gray-400 text-lg mb-2">للأسف..</p>
                        <h3 className="text-3xl font-bold text-red-500">{lastEliminated.name}</h3>
                        <p className="text-white mt-4">خرج بره اللعبة 💀</p>
                    </div>
                ) : (
                    <div className="bg-green-900/20 p-6 rounded-2xl border border-green-500/30">
                        <h3 className="text-2xl font-bold text-green-400">محدش مات! 🎉</h3>
                        <p className="text-gray-300 mt-2">ليلة هادية وعدت على خير</p>
                    </div>
                )}

                <button
                    onClick={onNext}
                    className="bg-white text-black font-bold py-4 px-10 rounded-xl hover:scale-105 transition-all mt-8"
                >
                    ابدأ المناقشة 🗣️
                </button>
            </div>
        );
    }

    // --- Discussion ---
    if (phase === 'DISCUSSION') {
        return <DiscussionTimer onNext={onNext} />;
    }

    // --- Voting ---
    if (phase === 'VOTING') {
        const alivePlayers = players.filter(p => p.isAlive);
        const [selectedId, setSelectedId] = useState<string | null>(null);

        return (
            <div className="flex flex-col h-full p-6 text-center">
                <h2 className="text-3xl font-black text-white mb-2">وقت التصويت 🗳️</h2>
                <p className="text-gray-400 mb-2">مين اللي شاكين فيه؟</p>
                <p className="text-accent-gold text-sm italic mb-6">"{votingQuote}"</p>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 mb-4">
                    {alivePlayers.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedId(prev => prev === p.id ? null : p.id)}
                            className={`
                                p-4 rounded-xl border transition-all
                                ${selectedId === p.id
                                    ? 'bg-red-600 border-red-400 text-white scale-105'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}
                            `}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onVote(null)}
                        className="w-full py-3 rounded-xl bg-gray-800 text-gray-400 font-bold text-sm"
                    >
                        Skip Voting (No one dies)
                    </button>
                    <button
                        onClick={() => selectedId && onVote(selectedId)}
                        disabled={!selectedId}
                        className={`
                            w-full py-4 rounded-xl font-black uppercase tracking-widest
                            ${selectedId ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-gray-800 text-gray-600'}
                        `}
                    >
                        Vote to Eliminate 🚫
                    </button>
                </div>
            </div>
        );
    }

    // --- Elimination Reveal ---
    if (phase === 'ELIMINATION_REVEAL') {
        return (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center space-y-6">
                <div className="text-6xl">👻</div>
                <h2 className="text-3xl font-black text-white">القرية اختارت..</h2>

                {lastEliminated ? (
                    <div className="bg-red-900/20 p-8 rounded-3xl border border-red-500/30 w-full max-w-sm">
                        <h3 className="text-4xl font-black text-red-500 mb-4">{lastEliminated.name}</h3>
                        <p className="text-gray-400 text-sm italic mb-4">"{eliminationQuote}"</p>

                        <div className={`text-2xl font-black px-4 py-2 rounded-lg inline-block
                            ${lastEliminated.role === 'MAFIA' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
                        `}>
                            {lastEliminated.role}
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <h3 className="text-2xl text-gray-400">محدش خرج النهاردة 🤷‍♂️</h3>
                    </div>
                )}

                <button
                    onClick={onNext}
                    className="bg-black border border-white/20 text-white font-bold py-4 px-12 rounded-xl hover:bg-white/10 transition-all mt-8"
                >
                    الليل يجي 🌙
                </button>
            </div>
        );
    }

    // --- Game Over ---
    if (phase === 'GAME_OVER') {
        const isMafiaWin = winner === 'MAFIA';
        return (
            <div className={`flex flex-col h-full items-center justify-center p-6 text-center ${isMafiaWin ? 'bg-red-900/10' : 'bg-blue-900/10'}`}>
                <div className="text-8xl mb-6">{isMafiaWin ? '😈' : '🎉'}</div>

                <h1 className={`text-5xl font-black mb-2 ${isMafiaWin ? 'text-red-500' : 'text-blue-400'}`}>
                    {isMafiaWin ? 'MAFIA WINS' : 'VILLAGERS WIN'}
                </h1>

                <p className="text-xl text-gray-300 mb-2">
                    {isMafiaWin ? 'البلد راحت.. والشر سيطر!' : 'العدالة انتصرت.. والبلد نضفت!'}
                </p>
                <p className="text-accent-gold italic mb-12">"{winQuote}"</p>

                <div className="w-full max-w-xs space-y-4">
                    <button
                        onClick={onReset}
                        className="w-full bg-accent-gold text-black font-black py-4 rounded-xl hover:scale-105 transition-all shadow-lg"
                    >
                        Play Again 🔄
                    </button>
                    <button
                        onClick={() => window.location.href = '/games'}
                        className="w-full bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10"
                    >
                        Exit to Menu
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

const DiscussionTimer = ({ onNext }: { onNext: () => void }) => {
    const [seconds, setSeconds] = useState(120); // 2 minutes

    useEffect(() => {
        if (seconds <= 0) return;
        const interval = setInterval(() => setSeconds(s => s - 1), 1000);
        return () => clearInterval(interval);
    }, [seconds]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}:${rem < 10 ? '0' : ''}${rem}`;
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-400 mb-8 uppercase tracking-widest">Discussion Time</h2>

            <div className="text-8xl font-black text-white font-mono tabular-nums mb-8">
                {formatTime(seconds)}
            </div>

            <p className="text-xl text-accent-gold font-medium mb-12">
                اتكلموا.. شكّوا.. ولعوا الدنيا 🔥
            </p>

            <div className="space-y-4 w-full max-w-xs">
                <button
                    onClick={() => setSeconds(s => s + 60)}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10"
                >
                    +1 Minute ⏱️
                </button>
                <button
                    onClick={onNext}
                    className="w-full bg-white text-black font-black py-4 rounded-xl hover:scale-105 transition-all"
                >
                    End Discussion & Vote 🗳️
                </button>
            </div>
        </div>
    );
};

export default MafiaDay;
