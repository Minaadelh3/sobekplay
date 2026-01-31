import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PointsAnimation() {
    const { activePlayer } = useAuth();
    const prevPointsRef = useRef<number>(0);
    const [diffs, setDiffs] = useState<{ id: number; val: number }[]>([]);

    useEffect(() => {
        if (!activePlayer) return;

        const current = activePlayer.personalPoints || 0;
        const prev = prevPointsRef.current;

        if (current > prev && prev !== 0) {
            const delta = current - prev;
            const id = Date.now();
            setDiffs(prev => [...prev, { id, val: delta }]);

            // Cleanup
            setTimeout(() => {
                setDiffs(prev => prev.filter(d => d.id !== id));
            }, 2000);
        }

        prevPointsRef.current = current;
    }, [activePlayer?.personalPoints]);

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 pointer-events-none z-[200]">
            <AnimatePresence>
                {diffs.map((d) => (
                    <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: -50, scale: 1.5 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 1 }}
                        className="text-4xl font-black text-accent-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                    >
                        +{d.val}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
