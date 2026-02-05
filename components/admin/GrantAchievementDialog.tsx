import React, { useState } from 'react';
import { Achievement } from '../../types/achievements';
import { AdminUser } from '../../hooks/useAdminData';
import { useAchievements } from '../../hooks/useAchievements';
import { useAuth } from '../../context/AuthContext';

interface GrantAchievementDialogProps {
    achievement: Achievement;
    users: AdminUser[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function GrantAchievementDialog({ achievement, users, onClose, onSuccess }: GrantAchievementDialogProps) {
    const { grantAchievement } = useAchievements();
    const { user: adminUser } = useAuth();

    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleGrant = async () => {
        if (!selectedUserId) return;
        setLoading(true);
        try {
            await grantAchievement(selectedUserId, achievement.id, adminUser?.id);
            alert(`✅ تم منح إنجاز "${achievement.name}" بنجاح!`);
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(`⚠️ فشلت العملية: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>🏆</span> منح إنجاز يدوي
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>

                {/* Achievement Summary */}
                <div className="bg-gradient-to-r from-accent-gold/10 to-transparent p-4 rounded-xl border border-accent-gold/20 mb-6 flex items-center gap-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                        <div className="font-bold text-white">{achievement.name}</div>
                        <div className="text-xs text-accent-gold font-mono">+{achievement.points} SP</div>
                    </div>
                </div>

                {/* User Selector */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-bold">Search User</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-accent-gold outline-none transition-colors"
                            placeholder={selectedUserId ? "Selected" : "Type name..."}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (selectedUserId) setSelectedUserId(''); // Clear selection on type
                            }}
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-xs">No users found</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUserId(user.id);
                                        setSearch(user.displayName || user.name || '');
                                    }}
                                    className={`p-2 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5 last:border-0
                                        ${selectedUserId === user.id ? 'bg-accent-gold/20' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <img src={user.avatar || user.photoURL || '/default-avatar.png'} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                    <div className="flex-1">
                                        <div className={`text-sm font-bold ${selectedUserId === user.id ? 'text-accent-gold' : 'text-white'}`}>
                                            {user.displayName || user.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500">{user.email}</div>
                                    </div>
                                    {selectedUserId === user.id && <span className="text-accent-gold font-bold">✔</span>}
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={handleGrant}
                        disabled={!selectedUserId || loading}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${!selectedUserId ? 'bg-gray-800 text-gray-500' : 'bg-accent-gold text-black hover:bg-yellow-400'}`}
                    >
                        {loading ? 'Processing...' : 'Grant Achievement'}
                    </button>
                </div>
            </div>
        </div>
    );
}
