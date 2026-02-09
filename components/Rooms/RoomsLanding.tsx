import React from 'react';
import { SearchBar } from './SearchBar';

import { Assignment } from '../../data/rooms/types';

interface RoomsLandingProps {
    onSelect: (name: string) => void;
    onAdminClick: () => void;
    assignments: Assignment[];
}

export const RoomsLanding: React.FC<RoomsLandingProps> = ({ onSelect, onAdminClick, assignments }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 pb-32">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    عايز تعرف أوضتك فين؟
                </h1>
                <p className="text-white/40 text-lg font-bold">
                    اكتب اسمك... وهنقولك أوضتك والدور والناس اللي معاك.
                </p>
            </div>

            <SearchBar onSelect={onSelect} onClear={() => { }} assignments={assignments} />

            {/* Admin Trigger */}
            <div className="mt-12">
                <button
                    onClick={onAdminClick}
                    className="flex items-center gap-2 px-4 py-2 border border-red-500/50 rounded-full text-red-500 hover:bg-red-500/10 transition-colors group"
                >
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold underline text-sm">يا عم افتح انا عمدة</span>
                </button>
            </div>
        </div>
    );
};
