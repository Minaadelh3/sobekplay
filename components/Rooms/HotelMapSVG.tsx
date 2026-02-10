import React from 'react';
import { motion } from 'framer-motion';

interface HotelMapSVGProps {
    floor: 1 | 2 | 3 | 4;
    highlightRoom?: string; // e.g. "Room 5"
    onRoomClick?: (room: string) => void;
    interactive?: boolean;
}

const RoomPath: React.FC<{
    id: string;
    d: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    isHighlighted: boolean;
    interactive?: boolean;
    onClick?: () => void;
    hasKing?: boolean;
}> = ({ id, x, y, w, h, label, isHighlighted, interactive, onClick, hasKing }) => {
    // "Cut Corner" shape: A square with a bevel on Top-Right
    // Or we can use `clipPath`. Let's use a polygon points string or path d.
    // Let's make a path that draws the rect with a cut corner.
    // Cut corner size = 15% of width.

    const cut = w * 0.2;
    // Path: Start Top-Left -> Top-Right (minus cut) -> Right-Top (plus cut) -> Bottom-Right -> Bottom-Left -> Close
    const pathD = `
        M ${x} ${y}
        L ${x + w - cut} ${y}
        L ${x + w} ${y + cut}
        L ${x + w} ${y + h}
        L ${x} ${y + h}
        Z
    `;

    return (
        <motion.g
            onClick={interactive ? onClick : undefined}
            initial={false}
            animate={{
                scale: isHighlighted ? 1.05 : 1,
                opacity: isHighlighted ? 1 : (interactive ? 0.8 : 0.3)
            }}
            className={interactive ? 'cursor-pointer' : ''}
            whileHover={interactive ? { scale: 1.02 } : {}}
        >
            <motion.path
                d={pathD}
                fill={isHighlighted ? '#FFD700' : '#1a1a1c'}
                stroke={isHighlighted ? '#FFD700' : 'rgba(255,255,255,0.2)'}
                strokeWidth="0.5"
                animate={{
                    fill: isHighlighted ? '#FFD700' : '#1a1a1c',
                    boxShadow: isHighlighted ? "0px 0px 20px #FFD700" : "none"
                }}
            />
            {/* L-Shape for King Bed (Visual Flair) */}
            {hasKing && !isHighlighted && (
                <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dy="2" fill="rgba(255,255,255,0.1)" fontSize="8" fontWeight="bold">L</text>
            )}

            {/* Label (Only if highlighted or interactive-hover?) - Req says "Room numbers appear only on hover / tap" */}
            {(isHighlighted) && (
                <text
                    x={x + w / 2}
                    y={y + h / 2}
                    textAnchor="middle"
                    dy="1"
                    fill={isHighlighted ? 'black' : 'white'}
                    fontSize="4"
                    fontWeight="900"
                >
                    {label}
                </text>
            )}
        </motion.g>
    );
};

export const HotelMapSVG: React.FC<HotelMapSVGProps> = ({ floor, highlightRoom, onRoomClick, interactive }) => {

    // Layout Config (0-100 coord system)
    const ROOMS = [
        // RIGHT COL (Nile)
        { id: "Room 1", x: 80, y: 10, w: 18, h: 18 },
        { id: "Room 2", x: 80, y: 32, w: 18, h: 18 },

        // TOP ROW (Nile) - R3 to R7
        { id: "Room 3", x: 60, y: 10, w: 18, h: 18, hasKing: true },
        { id: "Room 4", x: 40, y: 10, w: 18, h: 18 },
        { id: "Room 5", x: 20, y: 10, w: 18, h: 18, hasKing: true },
        { id: "Room 6", x: 0, y: 10, w: 18, h: 18 },
        { id: "Room 7", x: 0, y: 32, w: 18, h: 18 }, // Wrap/Stack? Description says "Top band... 3,4,5,6,7"

        // Redoing Top Band to fit 5 rooms horiz? 100 width / 5 = 20.
        // Let's refine coords for visual balance.
        // Top Row: 3, 4, 5, 6, 7 spanning x=0 to x=80?
        // Right Col: 1, 2 at x=80+?

        // Let's try:
        // Top Strip: R7, R6, R5, R4, R3 (Left to Right 0 -> 80)
        // Right Strip: R1, R2 (Top Down 10 -> 50)
        // Left Strip: R8, R9, R10 (Top Down 10 -> 90)
    ];

    // Revised Grid
    // Total Width 100, Height 80.
    // Margin 2.
    // ROW 1 (Top): R7 (0), R6 (20), R5 (40), R4 (60), R3 (80).
    // COL Right (Below R3): R1 (y=20), R2 (y=40).
    // COL Left (Below R7): R8 (y=20), R9 (y=40), R10 (y=60).
    // This creates a U-shape.

    const ALL_LAYOUT_ROOMS = [
        // Top Row
        { id: "R1-7", x: 2, y: 2, w: 18, h: 18 },
        { id: "R1-6", x: 22, y: 2, w: 18, h: 18 },
        { id: "R1-5", x: 42, y: 2, w: 18, h: 18, hasKing: true },
        { id: "R1-4", x: 62, y: 2, w: 18, h: 18 },
        { id: "R1-3", x: 82, y: 2, w: 18, h: 18, hasKing: true },

        // Right Col
        { id: "R1-1", x: 82, y: 22, w: 18, h: 18 },
        { id: "R1-2", x: 82, y: 42, w: 18, h: 18 },

        // Left Col
        { id: "R1-8", x: 2, y: 22, w: 18, h: 28 },
        { id: "R1-9", x: 2, y: 52, w: 18, h: 18 },
        { id: "R1-10", x: 2, y: 72, w: 18, h: 18 },
    ];

    // Floor 4 has unique codes (R4-8, R4-9, R4-10) but shares layout slots of R1-8, R1-9, R1-10
    // We need to remap the IDs for Floor 4
    let displayRooms = ALL_LAYOUT_ROOMS;

    if (floor === 4) {
        displayRooms = ALL_LAYOUT_ROOMS
            .filter(r => ["R1-8", "R1-9", "R1-10"].includes(r.id))
            .map(r => ({
                ...r,
                id: r.id.replace("R1-", "R4-") // specific re-map for Floor 4 codes
            }));
    }

    return (
        <div className="w-full aspect-[4/3] relative bg-[#121214] rounded-xl overflow-hidden shadow-2xl border border-white/10 p-4">

            {/* Floor Label */}
            <div className="absolute top-4 left-4 text-white/10 font-black text-6xl select-none pointer-events-none">
                {floor}
            </div>

            <svg viewBox="0 0 102 92" className="w-full h-full drop-shadow-xl">
                {/* Grid Pattern */}
                <defs>
                    <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {displayRooms.map(r => (
                    <RoomPath
                        key={r.id}
                        {...r}
                        d=""
                        label={r.id}
                        isHighlighted={highlightRoom === r.id}
                        interactive={interactive}
                        onClick={() => onRoomClick && onRoomClick(r.id)}
                        hasKing={r.hasKing}
                    />
                ))}
            </svg>
        </div>
    );
};
