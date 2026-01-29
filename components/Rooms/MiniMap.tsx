import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FLOOR_LAYOUT } from '../../data/rooms/layout';

interface MiniMapProps {
    floor: 1 | 2 | 3;
    highlightRoom?: string; // e.g. "R.5"
    onFloorChange: (f: 1 | 2 | 3) => void;
    onRoomClick?: (room: string) => void;
    interactive?: boolean;
}

export const MiniMap: React.FC<MiniMapProps> = ({ floor, highlightRoom, onFloorChange, onRoomClick, interactive = false }) => {

    // Separate Nile vs Side rooms
    const nileRooms = useMemo(() => FLOOR_LAYOUT.filter(r => r.view === 'NILE'), []);
    const sideRooms = useMemo(() => FLOOR_LAYOUT.filter(r => r.view === 'SIDE'), []);

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-24 font-arabic">

            {/* Visual Context */}
            <div className="text-center mb-8 space-y-2">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest">خريطة الفندق</h3>
                <p className="text-white/80 font-bold text-lg">توزيع الغرف - الدور {floor === 1 ? 'الأول' : floor === 2 ? 'الثاني' : 'الثالث'}</p>
            </div>

            {/* Map Container */}
            <div className="bg-[#0c0c0e] p-4 md:p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl">

                <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">

                    {/* NILE VIEW SECTION */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 px-2 opacity-50">
                            <span className="text-cyan-400 text-sm">🌊</span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Nile View</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {/* R1 - R4 */}
                            {nileRooms.slice(0, 4).map(meta => (
                                <RoomTile
                                    key={meta.room}
                                    meta={meta}
                                    isActive={meta.room === highlightRoom}
                                    onClick={interactive && onRoomClick ? () => onRoomClick(meta.room) : undefined}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 w-[75%]">
                            {/* R5 - R7 */}
                            {nileRooms.slice(4, 7).map(meta => (
                                <RoomTile
                                    key={meta.room}
                                    meta={meta}
                                    isActive={meta.room === highlightRoom}
                                    onClick={interactive && onRoomClick ? () => onRoomClick(meta.room) : undefined}
                                />
                            ))}
                        </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="w-px bg-white/5 mx-2" />

                    {/* SIDE VIEW SECTION */}
                    <div className="w-1/3">
                        <div className="flex items-center gap-2 mb-4 px-2 opacity-50">
                            <span className="text-white/40 text-sm">🏙️</span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Side View</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {sideRooms.map(meta => (
                                <RoomTile
                                    key={meta.room}
                                    meta={meta}
                                    isActive={meta.room === highlightRoom}
                                    onClick={interactive && onRoomClick ? () => onRoomClick(meta.room) : undefined}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const RoomTile: React.FC<{ meta: any, isActive: boolean, onClick?: () => void }> = ({ meta, isActive, onClick }) => {
    return (
        <motion.div
            layout
            initial={false}
            onClick={onClick}
            animate={{
                backgroundColor: isActive
                    ? '#FFD700'
                    : (onClick ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'), // Slighly lighter if interactive
                scale: isActive ? 1.05 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`
                aspect-[4/3] rounded-2xl flex flex-col items-center justify-center relative border transition-colors group
                ${isActive
                    ? 'border-transparent shadow-[0_0_25px_rgba(255,215,0,0.3)] z-20'
                    : 'border-white/5'}
                ${onClick ? 'cursor-pointer hover:border-white/20' : ''}
            `}
        >
            <span className={`text-xs md:text-sm font-black ${isActive ? 'text-black' : 'text-white/50'}`}>
                {meta.room}
            </span>

            {/* Active Label - KEEPING ONLY THIS */}
            {isActive && (
                <div className="absolute -top-3 bg-black text-accent-gold text-[8px] font-black px-2 py-0.5 rounded-full border border-accent-gold/50 shadow-sm">
                    أوضتك
                </div>
            )}
        </motion.div>
    );
};
