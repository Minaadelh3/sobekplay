import React, { useState } from 'react';
import { HotelMapSVG } from './HotelMapSVG';
import { Assignment, RoomMeta } from '../../data/rooms/types';
import { getAllAssignments } from '../../data/rooms/allocate';
import { ALL_ROOMS } from '../../data/rooms/layout';

export const RoomsAdmin: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [auth, setAuth] = useState(false);
    const [pass, setPass] = useState('');
    const [activeFloor, setActiveFloor] = useState<1 | 2 | 3>(1);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [searchQ, setSearchQ] = useState('');

    const verify = () => {
        if (pass.toLowerCase() === 'fratello') setAuth(true);
    };

    if (!auth) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
                <div className="bg-[#1e1e20] p-8 rounded-2xl w-full max-w-sm text-center border border-red-500/30">
                    <h3 className="text-red-500 font-black text-xl mb-4">منطقة محظورة</h3>
                    <input
                        type="password"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        placeholder="كلمة السر"
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-center mb-4"
                    />
                    <div className="flex gap-2">
                        <button onClick={onExit} className="flex-1 bg-white/10 text-white rounded-lg py-3 font-bold">إلغاء</button>
                        <button onClick={verify} className="flex-1 bg-red-600 text-white rounded-lg py-3 font-bold">دخول</button>
                    </div>
                </div>
            </div>
        );
    }

    const assignments = getAllAssignments();
    const roomMeta = ALL_ROOMS.find(r => r.room === selectedRoom);
    const occupants = assignments.filter(a => a.room === selectedRoom && a.floor === activeFloor);
    const filteredGuests = assignments.filter(a => a.personName.includes(searchQ));

    return (
        <div className="min-h-screen bg-[#101010] p-4 text-white pb-32">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">لوحة تحكم العمدة</h2>
                <button onClick={onExit} className="text-red-400 font-bold text-sm">خروج</button>
            </div>

            {/* Floor Selector */}
            <div className="flex gap-2 mb-6">
                {[1, 2, 3].map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFloor(f as 1 | 2 | 3)}
                        className={`flex-1 py-3 rounded-lg font-bold transition-colors ${activeFloor === f ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}
                    >
                        الدور {f}
                    </button>
                ))}
            </div>

            {/* Map */}
            <div className="mb-8">
                <HotelMapSVG
                    floor={activeFloor}
                    interactive={true}
                    onRoomClick={setSelectedRoom}
                    highlightRoom={selectedRoom || undefined}
                />
            </div>

            {/* Selected Room Details */}
            {selectedRoom && roomMeta && (
                <div className="bg-[#1e1e20] p-6 rounded-2xl border border-white/10 mb-8">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-2xl font-black text-accent-gold dir-ltr">{selectedRoom}</h3>
                        <span className="text-white/50">{roomMeta.type} VIEW</span>
                    </div>
                    <div className="flex gap-4 text-sm font-mono text-white/50 mb-4">
                        <span>Beds: {roomMeta.bedCount}</span>
                        <span>King: {roomMeta.hasKing ? 'Yes' : 'No'}</span>
                        <span>Occ: {occupants.length}/{roomMeta.bedCount}</span>
                    </div>
                    <div className="space-y-2">
                        {occupants.map((occ, i) => (
                            <div key={i} className="flex justify-between bg-black/20 p-2 rounded">
                                <span>{occ.personName}</span>
                                <span className="text-accent-gold text-xs">{occ.bedLabel}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guest Search */}
            <div className="mt-8">
                <h3 className="font-bold mb-4">بحث في القائمة ({assignments.length})</h3>
                <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="ابحث عن اسم..."
                    className="w-full bg-[#1e1e20] p-3 rounded-lg border border-white/10 mb-4 text-right"
                    dir="rtl"
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchQ && filteredGuests.map((g, i) => (
                        <div key={i} className="flex justify-between text-sm p-2 bg-white/5 rounded">
                            <span>{g.personName}</span>
                            <span className="text-white/40">F{g.floor} - {g.room}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
