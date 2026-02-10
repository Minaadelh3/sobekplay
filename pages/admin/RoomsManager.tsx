import React, { useEffect, useState } from 'react';
import { HotelMapSVG } from '../../components/Rooms/HotelMapSVG';
import { Assignment, RoomMeta } from '../../data/rooms/types';
import { ALL_ROOMS } from '../../data/rooms/layout';
import { RoomService } from '../../services/roomService';
import { Search, RotateCcw, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RoomsManager: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [activeFloor, setActiveFloor] = useState<1 | 2 | 3 | 4>(1);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [searchQ, setSearchQ] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load & Subscribe
    useEffect(() => {
        const init = async () => {
            try {
                // Ensure defaults exist
                // This might be better behind a button or optimized to not run every time?
                // For now, let's just subscribe and if empty, we can show a button to init
                // Actually, let's keep the auto-init logic simpler or manual
            } catch (e) {
                console.error("Init Error", e);
            }
        };
        init();

        const unsub = RoomService.subscribe((data) => {
            setAssignments(data);
            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    const handleInitialize = async () => {
        if (confirm("Are you sure? This will OVERWRITE existing assignments with the default algorithm.")) {
            setIsLoading(true);
            await RoomService.initializeDefaults();
            setIsLoading(false);
            toast.success("Assignments Initialized/Reset");
        }
    };

    // Derived State
    const roomMeta = ALL_ROOMS.find(r => r.room === selectedRoom);
    const occupants = assignments.filter(a => a.room === selectedRoom && a.floor === activeFloor);
    const filteredGuests = assignments.filter(a => a.personName.toLowerCase().includes(searchQ.toLowerCase()));

    // Actions
    const handleMove = async (personName: string, newRoom: string) => {
        // Find room meta to get floor
        const targetRoom = ALL_ROOMS.find(r => r.room === newRoom && r.floor === activeFloor); // Assumes moving on same floor for now? Or need fuller selector
        // Actually the map is per floor. 
        if (!targetRoom) return;

        await RoomService.updateAssignment(personName, {
            room: targetRoom.room,
            floor: targetRoom.floor,
            view: targetRoom.type,
            // bedLabel? Logic needed if full? 
            // For now, just update room.
        });
        toast.success(`Moved ${personName} to ${newRoom}`);
    };

    // Simplified for MVP: Select Person -> Click Room on Map -> Move?
    // OR: Click Room -> Show Occupants -> "Add Person" / "Remove"
    // Let's go with: Click Room -> Show List -> Drag/Drop or Select from list to add.

    // Better:
    // 1. Sidebar: List of all people (searchable)
    // 2. Main: Map
    // 3. Click Person in Sidebar -> "Select Mode"
    // 4. Click Room on Map -> "Assign to Room"

    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

    const handleRoomClick = async (roomName: string) => {
        const room = ALL_ROOMS.find(r => r.room === roomName && r.floor === activeFloor);
        if (!room) return;

        if (selectedPerson) {
            // Move selected person here
            await RoomService.updateAssignment(selectedPerson, {
                room: room.room,
                floor: room.floor,
                view: room.type,
                bedLabel: 'Unassigned Bed' // Placeholder
            });
            toast.success(`Moved ${selectedPerson} to ${room.room}`);
            setSelectedPerson(null);
        } else {
            setSelectedRoom(roomName);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black">إدارة الغرف</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleInitialize}
                        className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                        <RotateCcw size={18} />
                        إعادة تعيين
                    </button>
                    <div className="text-sm bg-white/5 px-4 py-2 rounded-lg">
                        Total: {assignments.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Visual Map Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Floor Selector */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFloor(f as 1 | 2 | 3 | 4)}
                                className={`flex-1 py-3 rounded-lg font-bold transition-colors ${activeFloor === f ? 'bg-accent-gold text-black' : 'bg-white/10 text-white/50'}`}
                            >
                                الدور {f}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#1e1e20] p-4 rounded-2xl border border-white/10 min-h-[500px] flex flex-col justify-center">
                        <HotelMapSVG
                            floor={activeFloor}
                            interactive={true}
                            onRoomClick={handleRoomClick}
                            highlightRoom={selectedRoom || undefined}
                        />
                        {selectedPerson && (
                            <div className="text-center mt-4 text-accent-gold animate-pulse">
                                اختر غرفة لنقل <b>{selectedPerson}</b>...
                            </div>
                        )}
                    </div>

                    {/* Room Details Panel (When Selected) */}
                    {selectedRoom && roomMeta && (
                        <div className="bg-[#1e1e20] p-6 rounded-2xl border border-white/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-accent-gold dir-ltr">{selectedRoom}</h3>
                                    <p className="text-white/50 text-sm">{roomMeta.type} VIEW • {occupants.length}/{roomMeta.bedCount} Beds</p>
                                </div>
                                <button onClick={() => setSelectedRoom(null)} className="text-white/30 hover:text-white">✕</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {occupants.map((occ) => (
                                    <div key={occ.personName} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${occ.room ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span>{occ.personName}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedPerson(occ.personName);
                                                setSelectedRoom(null); // Close panel to show map
                                            }}
                                            className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-accent-gold hover:text-black transition-colors"
                                        >
                                            نقل
                                        </button>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, roomMeta.bedCount - occupants.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="bg-black/10 p-3 rounded-lg border border-white/5 border-dashed flex items-center justify-center text-white/20 text-sm">
                                        Empty Bed
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: People List */}
                <div className="bg-[#1e1e20] rounded-2xl border border-white/10 flex flex-col h-[calc(100vh-140px)] sticky top-6">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="font-bold mb-4">الأشخاص ({assignments.length})</h3>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input
                                value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                                placeholder="بحث..."
                                className="w-full bg-black/30 p-2 pr-10 rounded-lg border border-white/10 text-right text-sm focus:border-accent-gold outline-none"
                                dir="rtl"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {assignments
                            .filter(a => a.personName.includes(searchQ))
                            .sort((a, b) => a.personName.localeCompare(b.personName, 'ar'))
                            .map((assignment) => (
                                <div
                                    key={assignment.personName}
                                    className={`
                                    p-3 rounded-lg text-sm flex justify-between items-center cursor-pointer transition-colors
                                    ${selectedPerson === assignment.personName ? 'bg-accent-gold text-black' : 'hover:bg-white/5 bg-white/5'}
                                `}
                                    onClick={() => setSelectedPerson(selectedPerson === assignment.personName ? null : assignment.personName)}
                                >
                                    <span className="font-medium truncate max-w-[120px]" title={assignment.personName}>
                                        {assignment.personName}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${selectedPerson === assignment.personName ? 'bg-black/10' : 'bg-black/30 text-white/50'}`}>
                                        {assignment.room || 'Unassigned'}
                                    </span>
                                </div>
                            ))}

                        {assignments.length === 0 && !isLoading && (
                            <div className="p-8 text-center text-white/30 text-sm">
                                لا يوجد بيانات.
                                <br />
                                اضغط "إعادة تعيين" للبدء.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomsManager;
