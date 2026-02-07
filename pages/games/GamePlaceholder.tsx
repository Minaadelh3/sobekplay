import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES_CONFIG } from '../../lib/games';

const GamePlaceholder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const game = GAMES_CONFIG.find(g => g.id === id);

    if (!game) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <h1 className="text-4xl mb-4">🚫</h1>
                <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
                <button onClick={() => navigate('/games')} className="text-accent-gold underline">Back to Games</button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center text-white p-6 text-center bg-gradient-to-br ${game.bgGradient}`}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-md w-full"
            >
                <div className="text-6xl mb-6">{game.icon}</div>
                <h1 className="text-4xl font-black mb-2">{game.title}</h1>
                <p className="text-gray-300 text-lg mb-8">{game.description}</p>

                <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg font-bold mb-8 border border-yellow-500/40 animate-pulse">
                    ⚠️ Under Construction
                    <br />
                    <span className="text-xs font-normal text-white/80">This game is coming soon!</span>
                </div>

                <button
                    onClick={() => navigate('/games')}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-105 transition-transform"
                >
                    Back to Arcade
                </button>
            </motion.div>
        </div>
    );
};

export default GamePlaceholder;
