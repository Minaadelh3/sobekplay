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
            className={`absolute top-0 left-0 md:top-4 md:left-4 z-50 p-4 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-arabic ${className}`}
        >
            <span className="text-2xl">➜</span>
            <span className="text-sm font-bold uppercase tracking-widest hidden md:inline">Back Home</span>
        </motion.button>
    );
};
