import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
    const [startPoint, setStartPoint] = useState(0);
    const [pullChange, setPullChange] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Threshold to trigger refresh
    const MIN_PULL = 80; // px

    const initTouch = (e: React.TouchEvent) => {
        if (window.scrollY === 0) { // Only if at top
            setStartPoint(e.touches[0].clientY);
        }
    };

    const touchMove = (e: React.TouchEvent) => {
        if (window.scrollY === 0 && startPoint > 0) {
            let pull = e.touches[0].clientY - startPoint;
            if (pull > 0) {
                // Resistance effect
                setPullChange(pull * 0.4);
            }
        }
    };

    const endTouch = () => {
        if (pullChange > MIN_PULL) {
            setRefreshing(true);
            setPullChange(MIN_PULL); // Hold position

            // Trigger Refresh Logic
            setTimeout(() => {
                window.location.reload();
                // Alternatively: call a refetch function provided via props
            }, 800);

        } else {
            setPullChange(0);
            setStartPoint(0);
        }
    };

    return (
        <div
            onTouchStart={initTouch}
            onTouchMove={touchMove}
            onTouchEnd={endTouch}
            className="min-h-screen relative"
        >
            {/* Loading Indicator */}
            <AnimatePresence>
                {(pullChange > 0 || refreshing) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: pullChange,
                            opacity: Math.min(pullChange / MIN_PULL, 1)
                        }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full flex justify-center items-end pb-2 overflow-hidden bg-black/20"
                    >
                        <motion.div
                            animate={{ rotate: refreshing ? 360 : pullChange * 2 }}
                            transition={{ repeat: refreshing ? Infinity : 0, duration: 1 }}
                            className="w-6 h-6 border-2 border-accent-gold border-t-transparent rounded-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                animate={{ y: refreshing ? MIN_PULL : pullChange }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
