import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HotelMapSVG } from './HotelMapSVG';
import { Assignment } from '../../data/rooms/types';
import { getRoommates } from '../../data/rooms/allocate';

interface RoomsDetailsProps {
    assignment: Assignment;
    onBack: () => void;
}

export const RoomsDetails: React.FC<RoomsDetailsProps> = ({ assignment, onBack }) => {
    const [showMap, setShowMap] = useState(false);
    const roommates = getRoommates(assignment.floor, assignment.room, assignment.personName);

    const roomName = assignment.room;

    return (
        <div className="min-h-screen pt-12 pb-32 px-4 flex flex-col items-center max-w-2xl mx-auto">

            {/* Header / Nav */}
            <div className="w-full flex justify-between items-center mb-8">
                <button
                    onClick={onBack}
                    className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full font-bold transition-colors"
                >
                    رجوع
                </button>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-[#1e1e20] border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2">{assignment.personName}</h2>
                    <p className="text-white/40 font-bold">نتمنى لك إقامة سعيدة ❤️</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <p className="text-xs text-white/30 font-bold uppercase mb-1">الدور</p>
                        <p className="text-xl font-bold text-white">
                            {assignment.floor === 1 ? 'الأول' : assignment.floor === 2 ? 'الثاني' : assignment.floor === 3 ? 'الثالث' : 'الرابع'}
                        </p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl text-center">
                        <p className="text-xs text-white/30 font-bold uppercase mb-1">الأوضة</p>
                        <p className="text-xl font-black text-accent-gold dir-ltr">{roomName}</p>
                    </div>
                </div>

                {/* Roommates */}
                <div className="bg-black/20 p-6 rounded-2xl">
                    <h3 className="text-xs text-center text-white/30 font-bold uppercase mb-4 tracking-widest">
                        اللي معاك في الأوضة
                    </h3>
                    <div className="space-y-2 text-center">
                        {roommates.map((mate, i) => (
                            <p key={i} className="text-white font-medium">{mate}</p>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Map Reveal Action */}
            {!showMap ? (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowMap(true)}
                    className="w-full bg-accent-gold text-black font-black text-lg py-4 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                    ورّيني الخريطة 🗺️
                </motion.button>
            ) : (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="w-full overflow-hidden"
                >
                    <HotelMapSVG
                        floor={assignment.floor}
                        highlightRoom={assignment.room}
                    />
                    <p className="text-center text-white/30 text-xs font-bold mt-4">مكان أوضتك متعلم بالأصفر</p>
                </motion.div>
            )}

        </div>
    );
};
