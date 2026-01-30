import React, { useState } from 'react';
import { SmartLevel, Suspect } from '../../types/SmartGameTypes';
import ImageWithFallback from '../ImageWithFallback';

interface DetectiveViewProps {
    level: SmartLevel;
    onAnswer: (answer: string) => void;
}

const DetectiveView: React.FC<DetectiveViewProps> = ({ level, onAnswer }) => {
    const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

    return (
        <div className="space-y-8">
            {/* Story Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">🕵️‍♂️</div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">ملف القضية</h3>
                        <p className="text-white/80 leading-relaxed text-lg">
                            {level.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Suspects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {level.content.suspects?.map((suspect) => (
                    <button
                        key={suspect.id}
                        onClick={() => setSelectedSuspect(suspect.id)}
                        className={`
                            relative p-4 rounded-xl text-right transition-all duration-300 border
                            ${selectedSuspect === suspect.id
                                ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                👤
                            </div>
                            <span className="font-bold text-lg">{suspect.name}</span>
                        </div>
                        <div className={`
                            bg-black/30 p-3 rounded-lg text-sm text-white/90 leading-relaxed relative
                            ${selectedSuspect === suspect.id ? 'text-white' : 'text-white/70'}
                        `}>
                            <span className="absolute -top-2 right-4 text-2xl text-white/20">❝</span>
                            {suspect.statement}
                        </div>
                    </button>
                ))}
            </div>

            {/* Hint / Question Area */}
            <div className="text-center pt-4">
                <p className="text-indigo-300 font-bold mb-6 animate-pulse">
                    {level.content.question}
                </p>

                <button
                    disabled={!selectedSuspect}
                    onClick={() => selectedSuspect && onAnswer(selectedSuspect)}
                    className="w-full md:w-auto px-12 py-4 bg-white text-black font-black rounded-full text-lg hover:scale-105 disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    اتهام! 👈
                </button>
            </div>
        </div>
    );
};

export default DetectiveView;
