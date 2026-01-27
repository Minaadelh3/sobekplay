import React from 'react';
import GameScene from '../components/vector-shift/GameScene';
import { Link } from 'react-router-dom';

const VectorShiftPage: React.FC = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Overlay UI */}
            <div className="absolute top-4 right-4 z-50">
                <Link to="/games" className="px-6 py-2 bg-white/10 text-white font-mono font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all">
                    EXIT SIMULATION
                </Link>
            </div>

            <GameScene />
        </div>
    );
};

export default VectorShiftPage;
