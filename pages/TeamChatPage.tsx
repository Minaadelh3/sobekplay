import React from 'react';
import { useAuth } from '../context/AuthContext';
import TeamChatCore from '../components/TeamChatCore';

export default function TeamChatPage() {
    const { activeTeam } = useAuth();

    if (!activeTeam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-white">
                <div className="text-4xl mb-4">🛡️</div>
                <h2 className="text-xl font-bold mb-2">اختر فريقك الأول</h2>
                <p className="text-gray-400">لازم تنضم لفريق عشان تشارك في الشات</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-[#070A0F] relative overflow-hidden">
            {/* Header */}
            <div className={`p-4 bg-gradient-to-r ${activeTeam.color} shadow-lg z-10 flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                    <img src={activeTeam.avatar} alt={activeTeam.name} className="w-10 h-10 rounded-full border-2 border-white/20 bg-black/20" />
                    <div>
                        <h1 className="font-bold text-white text-lg">{activeTeam.name}</h1>
                        <p className="text-white/80 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {activeTeam.totalPoints || 0} نقطة
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Chat */}
            <div className="flex-1 overflow-hidden relative">
                <TeamChatCore mode="page" />
            </div>
        </div>
    );
}
