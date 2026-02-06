import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GAMES_CONFIG, GameConfig } from '../lib/games';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

const GamesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'SOLO' | 'VERSUS'>('SOLO');

    const filteredGames = GAMES_CONFIG.filter(g => g.type === activeTab);

    return (
        <div className="min-h-screen bg-[#0B0F14] pb-24">
            <Navbar onSearchOpen={() => { }} />

            <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-32">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg flex justify-center items-center gap-3">
                        <span className="text-5xl">🎡</span> ملاهي سوبك
                    </h1>
                    <p className="text-gray-400 text-lg">العب.. نافس.. اكسب نقط!</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/5 p-1 rounded-2xl flex gap-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('SOLO')}
                            className={`
                                px-6 py-2 rounded-xl text-sm font-bold transition-all
                                ${activeTab === 'SOLO' ? 'bg-accent-gold text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white'}
                            `}
                        >
                            🧸 العب لوحدك
                        </button>
                        <button
                            onClick={() => setActiveTab('VERSUS')}
                            className={`
                                px-6 py-2 rounded-xl text-sm font-bold transition-all
                                ${activeTab === 'VERSUS' ? 'bg-red-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white'}
                            `}
                        >
                            ⚔️ واجه لاعب
                        </button>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode='wait'>
                        {filteredGames.map((game) => (
                            <GameCard key={game.id} game={game} onClick={() => navigate(`/games/${game.id}`)} />
                        ))}
                    </AnimatePresence>
                </div>

                {filteredGames.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        قريباً.. ⏳
                    </div>
                )}

            </main>

            <MobileBottomNav />
        </div>
    );
};

const GameCard = ({ game, onClick }: { game: GameConfig; onClick: () => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-3xl p-6 cursor-pointer group border border-white/5
                bg-gradient-to-br ${game.bgGradient}
                hover:border-white/20 hover:shadow-2xl transition-all duration-300
            `}
        >
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="text-4xl mb-3">{game.icon}</div>
                    <h3 className={`text-2xl font-black mb-1 ${game.color}`}>{game.title}</h3>
                    <p className="text-gray-300 text-sm font-medium leading-relaxed opacity-90">
                        {game.description}
                    </p>
                </div>

                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex flex-col items-center min-w-[60px]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">WIN</span>
                    <span className="text-accent-gold font-black text-lg">+{game.rewards.win}</span>
                </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                <button className="bg-white text-black font-black px-8 py-3 rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl flex items-center gap-2">
                    <span>▶️</span> ابدأ اللعب
                </button>
            </div>
        </motion.div>
    );
};

export default GamesPage;
