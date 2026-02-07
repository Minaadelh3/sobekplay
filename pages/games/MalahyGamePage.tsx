import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SOBEK_GAMES, GameLevel, Question } from '../../data/sobekGames';
import BackButton from '../../components/BackButton';

const MalahyGamePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const game = SOBEK_GAMES.find(g => g.id === id);

    const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
    const [qIndex, setQIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!game) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl">Game Not Found</h1>
                <button onClick={() => navigate('/app/games')} className="mt-4 text-blue-400">Back</button>
            </div>
        );
    }

    const currentQ = selectedLevel?.questions[qIndex];

    const nextQuestion = () => {
        if (!selectedLevel) return;
        if (qIndex < selectedLevel.questions.length - 1) {
            setQIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // End of level
            setSelectedLevel(null);
            setQIndex(0);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${game.gradient} text-white font-arabic safe-area-pb`}>

            {/* Header */}
            <div className="p-6 flex items-center justify-between relative z-10">
                <BackButton fallbackPath="/app/games" />
                <div className="text-center">
                    <h1 className="text-xl font-black">{game.title}</h1>
                    <span className="text-xs text-white/60">{selectedLevel ? selectedLevel.title : 'اختار المستوى'}</span>
                </div>
                <div className="w-8" />
            </div>

            <div className="max-w-md mx-auto px-6 mt-10 pb-20">
                <AnimatePresence mode='wait'>

                    {/* LEVEL SELECTION */}
                    {!selectedLevel && (
                        <motion.div
                            key="levels"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid gap-4"
                        >
                            <div className="text-center mb-8">
                                <div className="text-6xl mb-4">{game.icon}</div>
                                <p className="text-white/80 leading-relaxed">{game.description}</p>
                            </div>

                            {game.levels.map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => setSelectedLevel(level)}
                                    className="bg-white/10 border border-white/5 p-6 rounded-2xl text-right hover:bg-white/20 transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
                                    <h3 className={`text-xl font-bold mb-1 ${level.color}`}>{level.title}</h3>
                                    <p className="text-sm text-white/60">{level.description}</p>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-50 group-hover:translate-x-[-5px] transition-transform">
                                        👈
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* GAMEPLAY */}
                    {selectedLevel && currentQ && (
                        <motion.div
                            key="gameplay"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="relative aspect-[3/4] md:aspect-video w-full"
                        >
                            {/* Card */}
                            <motion.div
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="w-full h-full bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 text-xs font-mono text-white/40">
                                    {qIndex + 1} / {selectedLevel.questions.length}
                                </div>

                                <h2 className="text-2xl md:text-4xl font-bold leading-relaxed mb-6">
                                    {currentQ.text}
                                </h2>

                                {currentQ.subtext && (
                                    <p className="text-lg text-white/60 mb-6">{currentQ.subtext}</p>
                                )}

                                <div className={`text-sm py-1 px-3 rounded-full bg-black/30 text-white/50 border border-white/5`}>
                                    {currentQ.type === 'speak' ? '🗣️ للنقاش' : '⚖️ اختار'}
                                </div>
                            </motion.div>

                            {/* Controls */}
                            <div className="mt-8 flex justify-between items-center gap-4">
                                <button
                                    onClick={() => setSelectedLevel(null)}
                                    className="p-4 rounded-full bg-white/5 hover:bg-white/10"
                                >
                                    Levels
                                </button>
                                <button
                                    onClick={nextQuestion}
                                    className="flex-1 py-4 bg-white text-black rounded-xl font-black text-lg hover:scale-105 transition-transform"
                                >
                                    {qIndex < selectedLevel.questions.length - 1 ? 'التالي' : 'خلصنا 🏁'}
                                </button>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default MalahyGamePage;
