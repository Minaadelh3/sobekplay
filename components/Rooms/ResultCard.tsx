import React from 'react';
import { motion } from 'framer-motion';
import { Assignment } from '../../data/rooms/types';

export const ResultCard: React.FC<{ data: Assignment }> = ({ data }) => {
    const isKing = data.bedType === 'KING';
    const isNile = data.view === 'NILE';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto bg-[#121214] border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl mt-8"
        >
            {/* Decorative Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-20 ${isNile ? 'bg-cyan-500' : 'bg-white'}`} />

            <div className="relative z-10 p-8 text-center">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-snug mb-2">
                        {data.personName}
                    </h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/50 font-bold">
                        <span>{data.floor === 3 ? '🌸 الدور الثالث (بنات)' : '🦁 الدور ' + (data.floor === 1 ? 'الأول' : 'الثاني') + ' (ولاد)'}</span>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5 mb-6" />

                {/* Room & Bed */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">الغرفة</p>
                        <p className="text-2xl font-black text-white dir-ltr">{data.room}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-colors">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">السرير</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">{isKing ? '👑' : '🛏️'}</span>
                            <p className="text-lg font-bold text-white">{isKing ? 'King' : 'Single'}</p>
                        </div>
                    </div>
                </div>

                {/* View & Roommate */}
                <div className="space-y-3">
                    <div className={`p-4 rounded-2xl flex items-center justify-between border ${isNile ? 'bg-cyan-900/10 border-cyan-500/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{isNile ? '🌊' : '🏙️'}</span>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold opacity-50">الإطلالة</p>
                                <p className="font-bold text-sm md:text-base">{isNile ? 'Nile View' : 'Side View'}</p>
                            </div>
                        </div>
                    </div>

                    {isKing && data.roommateName && (
                        <div className="p-4 rounded-2xl bg-accent-gold/5 border border-accent-gold/10 flex items-center justify-between">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-accent-gold/70">ساكن مع</p>
                                <p className="font-bold text-accent-gold text-lg">{data.roommateName}</p>
                            </div>
                            <div className="text-2xl opacity-80">🤝</div>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
};
