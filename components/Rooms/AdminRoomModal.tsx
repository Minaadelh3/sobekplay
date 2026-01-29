import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomMeta, Assignment } from '../../data/rooms/types';

interface AdminRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomMeta: RoomMeta;
    floor: number;
    occupants: Assignment[]; // Restored prop
}

export const AdminRoomModal: React.FC<AdminRoomModalProps> = ({ isOpen, onClose, roomMeta, floor, occupants }) => {

    // Logic for Admin
    const totalCapacity = (roomMeta.kingPairs * 2) + roomMeta.singles;
    const currentCount = occupants.length;
    const isFull = currentCount >= totalCapacity;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-[#121214] w-full max-w-md rounded-3xl border border-white/10 p-6 relative z-10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-1 dir-ltr inline-block">{roomMeta.room}</h2>
                                <span className="mx-2 text-white/20">|</span>
                                <span className="text-accent-gold font-bold">
                                    {floor === 1 ? 'الدور الأول' : floor === 2 ? 'الدور الثاني' : 'الدور الثالث'}
                                </span>
                            </div>
                            <button onClick={onClose} className="text-white/40 hover:text-white p-2">✕</button>
                        </div>

                        {/* Admin Data Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 rounded-xl p-3">
                                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">الإطلالة</p>
                                <p className="text-white font-bold">{roomMeta.view === 'NILE' ? 'Nile View' : 'Side View'}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3">
                                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">السعة</p>
                                <p className={`font-bold ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                                    {isFull ? 'ممتلئة' : `متاح ${totalCapacity - currentCount}`}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3">
                                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">نوع السرير</p>
                                <p className="text-white font-bold text-sm">
                                    {roomMeta.kingPairs > 0 ? `${roomMeta.kingPairs} King` : ''}
                                    {roomMeta.kingPairs > 0 && roomMeta.singles > 0 ? ' + ' : ''}
                                    {roomMeta.singles > 0 ? `${roomMeta.singles} Single` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Occupants List (Privileged Data) */}
                        <div className="space-y-3">
                            <h3 className="text-red-500/50 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                بيانات المقيمين (سري للغاية)
                            </h3>

                            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                                {occupants.length > 0 ? occupants.map((occ, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[#1a1a1c] p-3 rounded-lg border border-white/5">
                                        <span className="font-bold text-white text-sm">{occ.personName}</span>
                                        <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded font-mono">
                                            {occ.bedType}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-white/20 text-xs italic">الغرفة فارغة حالياً</div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
