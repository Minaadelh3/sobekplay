import React, { useState } from 'react';
import { useGameControl, GameDoc } from '../../hooks/useGameControl';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamesManager() {
    const { games, loading, toggleGameStatus, updateGameConfig } = useGameControl();
    const [selectedGame, setSelectedGame] = useState<GameDoc | null>(null);

    if (loading) return <div className="text-white p-10 text-center">Loading Mission Control...</div>;

    const activeGames = games.filter(g => g.isEnabled).length;
    const totalGames = games.length;

    return (
        <div className="space-y-8 pb-20">
            {/* 1. Command Center Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-black p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
                    <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-2">System Status</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">{activeGames}</span>
                        <span className="text-gray-500">/ {totalGames} Active</span>
                    </div>
                    <div className="absolute right-4 top-4 text-purple-500 text-4xl opacity-20">🎮</div>
                </div>
                {/* Add more stats cards here later */}
            </div>

            {/* 2. Games Grid */}
            {/* 2. Games Grid - Categorized */}

            {/* Solo / Trivia Sector */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                    <span>🧘</span> Solo & Trivia Sector
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {games.filter(g => g.type === 'SOLO').map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onToggle={() => toggleGameStatus(game.id, !game.isEnabled)}
                            onEdit={() => setSelectedGame(game)}
                        />
                    ))}
                </div>
            </div>

            {/* Social / Party Sector */}
            <div>
                <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                    <span>🔥</span> Social & Party Sector
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {games.filter(g => g.type === 'VERSUS').map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onToggle={() => toggleGameStatus(game.id, !game.isEnabled)}
                            onEdit={() => setSelectedGame(game)}
                        />
                    ))}
                </div>
            </div>

            {/* 3. Edit Modal */}
            <AnimatePresence>
                {selectedGame && (
                    <GameEditModal
                        game={selectedGame}
                        onClose={() => setSelectedGame(null)}
                        onSave={updateGameConfig}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub Components ---

const GameCard = ({ game, onToggle, onEdit }: { game: GameDoc, onToggle: () => void, onEdit: () => void }) => {
    return (
        <div className={`
            relative group rounded-2xl border transition-all duration-300 overflow-hidden
            ${game.isEnabled ? 'bg-[#141414] border-white/5 hover:border-accent-gold/50' : 'bg-black border-red-900/20 opacity-70 grayscale'}
        `}>
            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${game.isEnabled ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`} />

            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{game.icon}</div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{game.title}</h3>
                        <p className="text-xs text-gray-500 uppercase font-mono">{game.type}</p>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-black/40 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-xs text-gray-500">WIN REWARD</div>
                        <div className="font-mono font-bold text-accent-gold">{game.rewards.win} SP</div>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-xs text-gray-500">PLAYS</div>
                        <div className="font-mono font-bold text-white">{game.playCount || 0}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold text-sm transition-colors border border-white/5"
                    >
                        ⚙️ إعدادات
                    </button>
                    <button
                        onClick={onToggle}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${game.isEnabled
                            ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                            : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                            }`}
                    >
                        {game.isEnabled ? 'إيقاف' : 'تفعيل'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GameEditModal = ({ game, onClose, onSave }: { game: GameDoc, onClose: () => void, onSave: (id: string, updates: any) => void }) => {
    const [rewards, setRewards] = useState(game.rewards);
    const [title, setTitle] = useState(game.title);

    const handleSave = () => {
        onSave(game.id, {
            title,
            rewards
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-black/50 p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        Configuring: <span className="text-accent-gold">{game.title}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Game Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                        />
                    </div>

                    {/* Economics Engine */}
                    <div>
                        <label className="block text-xs font-bold text-yellow-500 uppercase mb-4 flex items-center gap-2">
                            <span>💰</span> Points Engine
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400">Win Reward</label>
                                <input
                                    type="number"
                                    value={rewards.win}
                                    onChange={e => setRewards({ ...rewards, win: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Streak Bonus</label>
                                <input
                                    type="number"
                                    value={rewards.streak || 0}
                                    onChange={e => setRewards({ ...rewards, streak: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                />
                            </div>
                            {/* Versus specific */}
                            {game.type === 'VERSUS' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400">Loss Consolation</label>
                                        <input
                                            type="number"
                                            value={rewards.loss || 0}
                                            onChange={e => setRewards({ ...rewards, loss: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400">Draw Reward</label>
                                        <input
                                            type="number"
                                            value={rewards.draw || 0}
                                            onChange={e => setRewards({ ...rewards, draw: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-black/50 p-6 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/20">Save Configuration</button>
                </div>
            </motion.div>
        </div>
    );
};
