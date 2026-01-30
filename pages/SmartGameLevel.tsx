import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import { SMART_GAMES_DATA } from '../data/smart_games_data';
import { SmartLevel } from '../types/SmartGameTypes';
import { sendMessageToApi } from '../services/chatClient';

// --- VIEWS ---
import DetectiveView from '../components/SmartGames/DetectiveView';
import QuizView from '../components/SmartGames/QuizView';

const SmartGameLevel: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const level = SMART_GAMES_DATA.find(l => l.id === Number(id));

    const [isSolved, setIsSolved] = useState(false);
    const [isWrong, setIsWrong] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [loadingHint, setLoadingHint] = useState(false);
    const [hintText, setHintText] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!level) return <div className="text-white text-center pt-32">Level not found</div>;

    const handleAnswer = (answer: any) => {
        // Normalize comparison
        const isCorrect = String(answer).toLowerCase() === String(level.content.correctAnswer).toLowerCase();

        if (isCorrect) {
            setIsSolved(true);
            setIsWrong(false);
            setFeedback(level.content.explanation);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 2000); // Reset shake
        }
    };

    const requestAIExplanation = async () => {
        if (hintText) return; // Already fetched
        setLoadingHint(true);
        const prompt = `
            The user is playing a "${level.difficulty}" puzzle named "${level.title}".
            Question: "${level.content.question}"
            Correct Answer: "${level.content.correctAnswer}".
            User solved it correctly.
            PLEASE explain WHY this is the answer in simple, fun Egyptian Arabic. 
            Keep it under 30 words. Congratulations involved.
            Don't mention "AI". Be "Abn Akho Sobek".
        `;
        const res = await sendMessageToApi(prompt);
        setHintText(res.reply);
        setLoadingHint(false);
    };

    // Render the correct view based on type
    const renderGameView = () => {
        switch (level.type) {
            case 'detective':
                return <DetectiveView level={level} onAnswer={handleAnswer} />;
            case 'logic':
            case 'trivia':
            case 'observation':
            case 'puzzle':
                return <QuizView level={level} onAnswer={handleAnswer} />;
            default:
                return <div>Unsupported Level Type</div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-purple-500/30 overflow-x-hidden" dir="rtl">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between">
                <BackButton fallbackPath="/smart-games" className="!relative !top-0 !left-0 !w-10 !h-10" />
                <h2 className="text-lg font-bold">{level.title}</h2>
                <div className="w-10" /> {/* Balance */}
            </div>

            {/* Game Content */}
            <div className="max-w-2xl mx-auto p-6 pb-32">
                <AnimatePresence mode="wait">
                    {!isSolved ? (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={isWrong ? 'animate-shake' : ''}
                        >
                            {renderGameView()}

                            {/* Wrong Feedback Toast */}
                            {isWrong && (
                                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
                                    <span className="font-bold">حاول تاني! ❌</span>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center pt-10"
                        >
                            <div className="text-6xl mb-6 animate-bounce">🎉</div>
                            <h2 className="text-3xl font-black text-green-400 mb-4">إجابة صحيحة!</h2>
                            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl mb-8">
                                <p className="text-lg leading-relaxed text-green-100">
                                    {feedback}
                                </p>
                            </div>

                            {/* AI Explanation Button */}
                            <div className="mb-8">
                                <button
                                    onClick={requestAIExplanation}
                                    disabled={loadingHint || !!hintText}
                                    className="text-sm font-bold text-indigo-400 underline hover:text-indigo-300 disabled:no-underline disabled:text-gray-500"
                                >
                                    {hintText ? '👇 رأي سوبِك 👇' : 'عايز شرح أكتر من سوبِك؟'}
                                </button>
                                {loadingHint && <p className="text-xs text-indigo-300 mt-2 animate-pulse">بيكتب...</p>}
                                {hintText && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="mt-4 bg-indigo-900/20 p-4 rounded-xl text-indigo-200 text-sm border border-indigo-500/30"
                                    >
                                        "{hintText}"
                                    </motion.div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    const nextId = level.id + 1;
                                    if (SMART_GAMES_DATA.find(l => l.id === nextId)) {
                                        navigate(`/smart-games/${nextId}`);
                                        setIsSolved(false); // Reset internal state
                                        setIsWrong(false);
                                        setHintText('');
                                    } else {
                                        navigate('/smart-games');
                                    }
                                }}
                                className="w-full bg-white text-black font-black py-4 rounded-xl text-xl hover:scale-105 transition-transform"
                            >
                                {SMART_GAMES_DATA.find(l => l.id === level.id + 1) ? 'المستوى التالي ⬅️' : 'العودة للقائمة 🏠'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SmartGameLevel;
