import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BackButton: React.FC<{ className?: string }> = ({ className = '' }) => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className={`fixed top-4 left-4 md:top-8 md:left-8 z-50 px-4 py-3 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/40 transition-all flex items-center gap-2 font-arabic shadow-xl safe-area-pt ${className}`}
        >
            <span className="text-xl rtl:rotate-180">➜</span>
            <span className="text-sm font-bold uppercase tracking-widest hidden md:inline">Back Home</span>
        </motion.button>
    );
};
