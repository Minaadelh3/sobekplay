import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RoomsLanding } from '../../components/Rooms/RoomsLanding';
import { RoomsDetails } from '../../components/Rooms/RoomsDetails';
import { RoomsAdmin } from '../../components/Rooms/RoomsAdmin';
import { getAllAssignments } from '../../data/rooms/allocate';

import { useTabReset } from '../../hooks/useTabReset';

type ViewState = 'LANDING' | 'DETAILS' | 'ADMIN';

const RoomsPage: React.FC = () => {
    const [view, setView] = useState<ViewState>('LANDING');
    const [selectedName, setSelectedName] = useState<string | null>(null);

    // Tab Reset Logic
    const handleTabReset = React.useCallback(() => {
        setView('LANDING');
        setSelectedName(null);
    }, []);

    useTabReset('/rooms', handleTabReset);

    const assignments = getAllAssignments();
    const selectedAssignment = selectedName ? assignments.find(a => a.personName === selectedName) : null;

    const handleSelect = (name: string) => {
        setSelectedName(name);
        setView('DETAILS');
    };

    const handleBack = () => {
        setView('LANDING');
        setSelectedName(null);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-arabic overflow-x-hidden selection:bg-accent-gold/30" dir="rtl">
            <AnimatePresence mode="wait">
                {view === 'LANDING' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <RoomsLanding
                            onSelect={handleSelect}
                            onAdminClick={() => setView('ADMIN')}
                        />
                    </motion.div>
                )}

                {view === 'DETAILS' && selectedAssignment && (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <RoomsDetails
                            assignment={selectedAssignment}
                            onBack={handleBack}
                        />
                    </motion.div>
                )}

                {view === 'ADMIN' && (
                    <motion.div
                        key="admin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <RoomsAdmin onExit={() => setView('LANDING')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoomsPage;
