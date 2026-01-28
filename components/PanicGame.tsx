import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPanicPrompt, getJudgment, PanicPrompt } from '../data/panicData';

export const PanicGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'RESULT'>('INTRO');
    const [currentPrompt, setCurrentPrompt] = useState<PanicPrompt | null>(null);
    const [timeLeft, setTimeLeft] = useState(5);
    const [round, setRound] = useState(1);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Timer Logic
    useEffect(() => {
        let timer: any;
        if (gameState === 'PLAYING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (gameState === 'PLAYING' && timeLeft === 0) {
            handleTimeUp();
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Actions
    const startGame = () => {
        nextRound();
    };

    const nextRound = () => {
        const prompt = getPanicPrompt(round);
        setCurrentPrompt(prompt);
        setTimeLeft(5);
        setGameState('PLAYING');
    };

    const handleTimeUp = () => {
        setResultMessage("الوقت خلص! 🚨");
        setIsSuccess(false);
        setGameState('RESULT');
    };

    const handleSuccess = () => {
        setResultMessage("عاش! 🔥");
        setIsSuccess(true);
        setGameState('RESULT');
    };

    const handleFail = () => {
        setResultMessage(getJudgment());
        setIsSuccess(false);
        setGameState('RESULT');
    };

    const handleNextPlayer = () => {
        setRound(r => r + 1);
        nextRound();
    };

    // --- RENDERERS ---

    if (gameState === 'INTRO') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-950 text-center text-white relative overflow-hidden">
                <button onClick={onExit} className="absolute top-6 left-6 z-50 text-white/60 hover:text-white">← Back</button>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 font-arabic drop-shadow-lg" dir="rtl">
                        قول بسرعة!! ⏱️
                    </h1>
                    <p className="text-xl text-white/80 mb-8 font-arabic leading-relaxed" dir="rtl">
                        قدامك ٥ ثواني بس عشان تقول ٣ حاجات.. <br />
                        التفكير ممنوع. التوتر مسموح. <br />
                        تجهّزوا للفضايح.
                    </p>
                    <button
                        onClick={startGame}
                        className="px-12 py-5 bg-white text-red-900 font-black text-2xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                    >
                        I'm Ready 🔥
                    </button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'RESULT') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white transition-colors duration-300 ${isSuccess ? 'bg-green-900' : 'bg-red-900'}`}>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-black/20 p-12 rounded-[2rem] border border-white/10 backdrop-blur-sm"
                >
                    <div className="text-8xl mb-6">
                        {isSuccess ? '🎉' : '💀'}
                    </div>
                    <h2 className="text-4xl font-black mb-4 font-arabic" dir="rtl">
                        {resultMessage}
                    </h2>

                    {!isSuccess && (
                        <p className="text-white/60 mb-8 font-arabic">
                            السرعة مش للجميع برضو..
                        </p>
                    )}

                    <button
                        onClick={handleNextPlayer}
                        className="w-full py-4 bg-white text-black font-bold text-xl rounded-xl hover:bg-white/90 transition-colors shadow-xl"
                    >
                        Next Victim ➜
                    </button>
                </motion.div>
            </div>
        );
    }

    // PLAYING STATE
    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-[#0f0505] relative overflow-hidden">

            {/* SHAKE EFFECT PARENT */}
            <motion.div
                className="absolute inset-0"
                animate={timeLeft <= 2 ? { x: [-2, 2, -2, 2, 0] } : {}}
                transition={{ duration: 0.2, repeat: timeLeft <= 2 ? Infinity : 0 }}
            />

            {/* TIMER */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full">
                <div className="relative">
                    <motion.div
                        key={timeLeft}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-[12rem] font-black leading-none drop-shadow-2xl font-mono ${timeLeft <= 2 ? 'text-red-500' : 'text-white'}`}
                    >
                        {timeLeft}
                    </motion.div>
                    <div className="text-center text-white/30 tracking-[0.5em] uppercase font-bold mt-4">Seconds Left</div>
                </div>
            </div>

            {/* PROMPT */}
            <div className="w-full max-w-xl relative z-20 mb-12">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-zinc-900 border border-red-500/20 p-8 rounded-3xl text-center shadow-2xl relative"
                >
                    <div className="inline-block bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                        Round {round}
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-white font-arabic leading-relaxed" dir="rtl">
                        {currentPrompt?.text}
                    </h3>
                </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="w-full max-w-xl grid grid-cols-2 gap-4 relative z-20 mb-8">
                <button
                    onClick={handleFail}
                    className="py-6 bg-red-600/20 border border-red-600/50 text-red-100 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                >
                    Stuttered? 🤐
                </button>
                <button
                    onClick={handleSuccess}
                    className="py-6 bg-green-600 text-white font-black text-xl rounded-2xl hover:bg-green-500 transition-all shadow-lg hover:shadow-green-900/50 active:scale-95"
                >
                    Done! ✅
                </button>
            </div>
        </div>
    );
};
