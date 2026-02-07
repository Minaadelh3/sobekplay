
import React from 'react';
import { motion } from 'framer-motion';
import { PrayerSection } from '../../hooks/usePrayers';

interface AgpeyaHubProps {
    prayers: PrayerSection[];
    onSelectHour: (id: string) => void;
}

const AgpeyaHub: React.FC<AgpeyaHubProps> = ({ prayers, onSelectHour }) => {
    return (
        <div className="min-h-screen bg-[#050608] p-4 md:p-8 lg:p-12 pb-32">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-yellow-600 mb-4" style={{ fontFamily: 'var(--font-arabic)' }}>
                    الأجبية المقدسة
                </h1>
                <p className="text-gray-400 text-lg">صلوات السواعي</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {prayers.map((prayer, index) => (
                    <motion.button
                        key={prayer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectHour(prayer.id)}
                        className="group relative overflow-hidden rounded-3xl bg-[#0F1218] border border-white/5 hover:border-accent-gold/30 p-8 text-right transition-all duration-300 hover:shadow-2xl hover:shadow-accent-gold/10 hover:-translate-y-1"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-accent-gold/10" />

                        <div className="relative z-10 flex flex-col items-end h-full">
                            <span className="text-4xl mb-4 filter drop-shadow-lg">{prayer.icon}</span>

                            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-gold transition-colors">
                                {prayer.title}
                            </h2>

                            <p className="text-sm text-gray-400 mb-4 font-light">
                                {prayer.subtitle}
                            </p>

                            <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    ابدأ الصلاة ←
                                </span>
                                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                                    {prayer.timeNote?.split(' ')[1] || 'صلاة'}
                                </span>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default AgpeyaHub;
