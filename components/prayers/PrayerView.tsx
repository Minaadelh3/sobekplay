
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrayers } from '../../hooks/usePrayers';
import { prayersDefaults } from '../../data/prayersDefaults';
import AgpeyaHub from './AgpeyaHub';
import PrayerDetailView from './PrayerDetailView';

const PrayerView: React.FC = () => {
    const { prayers } = usePrayers();

    // Merge DB overrides if any
    const displayPrayers = prayersDefaults.map(defaultPrayer => {
        const override = prayers.find(p => p.id === defaultPrayer.id);
        return override ? { ...defaultPrayer, ...override } : defaultPrayer;
    });

    const [selectedHourId, setSelectedHourId] = useState<string | null>(null);

    const handleSelectHour = (id: string) => {
        setSelectedHourId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setSelectedHourId(null);
    };

    const selectedPrayer = displayPrayers.find(p => p.id === selectedHourId);

    return (
        <div className="bg-[#050608] min-h-screen">
            <AnimatePresence mode="wait">
                {!selectedHourId ? (
                    <motion.div
                        key="hub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <AgpeyaHub
                            prayers={displayPrayers}
                            onSelectHour={handleSelectHour}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        {selectedPrayer && (
                            <PrayerDetailView
                                prayer={selectedPrayer}
                                onBack={handleBack}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PrayerView;
