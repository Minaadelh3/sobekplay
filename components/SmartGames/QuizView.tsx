import React, { useState } from 'react';
import { SmartLevel } from '../../types/SmartGameTypes';
import ImageWithFallback from '../ImageWithFallback';

interface QuizViewProps {
    level: SmartLevel;
    onAnswer: (answer: string | number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ level, onAnswer }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmitInput = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAnswer(inputValue.trim());
        }
    };

    return (
        <div className="space-y-8">

            {/* Visual Header (if Image exists) */}
            {level.content.image && (
                <div className="w-full aspect-video bg-black/20 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative group">
                    {level.content.image.startsWith('/') ? (
                        <ImageWithFallback
                            src={level.content.image}
                            alt="Puzzle"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        // Placeholder for SVG/Shape puzzles if no path provided
                        <div className="text-white/20 font-mono text-center">
                            <span className="text-6xl block mb-2">🧩</span>
                            {level.title}
                        </div>
                    )}
                </div>
            )}

            {/* Question Card */}
            <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                    {level.content.question}
                </h3>
                {level.description && (
                    <p className="text-white/60 text-lg">{level.description}</p>
                )}
            </div>

            {/* Input Area: Options OR Text Input */}
            {level.content.options && level.content.options.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {level.content.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => onAnswer(idx)} // Sending Index as answer for Arrays
                            className="bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/50 p-6 rounded-xl text-lg font-bold text-white transition-all active:scale-95 text-right flex items-center gap-4 group"
                        >
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm group-hover:bg-white group-hover:text-black transition-colors">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            ) : (
                <form onSubmit={handleSubmitInput} className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="اكتب إجابتك هنا..."
                        className="w-full bg-black/30 border border-white/20 rounded-xl px-6 py-4 text-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center placeholder:text-white/20"
                    />
                    <button
                        type="submit"
                        className="absolute left-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-bold transition-all"
                    >
                        تأكيد
                    </button>
                </form>
            )}

        </div>
    );
};

export default QuizView;
