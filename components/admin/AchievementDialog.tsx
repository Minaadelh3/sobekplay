import React, { useState, useEffect } from 'react';
import { Achievement, AchievementCondition } from '../../types/achievements';

interface AchievementDialogProps {
    achievement?: Achievement | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function AchievementDialog({ achievement, onClose, onSave }: AchievementDialogProps) {
    const [formData, setFormData] = useState<Partial<Achievement>>({
        name: '',
        description: '',
        points: 0,
        icon: '🏆',
        category: 'ACTIVITY',
        conditionType: 'MANUAL',
        repeatable: false,
        isActive: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (achievement) {
            setFormData(achievement);
        }
    }, [achievement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error saving achievement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black text-white">
                        {achievement ? 'Edit Achievement' : 'New Achievement'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs text-gray-400 mb-1">Icon</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-center text-2xl"
                                placeholder="🏆"
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-xs text-gray-400 mb-1">Name (Arabic - Slang preferred)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-20 resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Points Value (SP)</label>
                            <input
                                type="number"
                                value={formData.points}
                                onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="ACTIVITY">Activity</option>
                                <option value="TEAM">Team</option>
                                <option value="ASWANY">Aswany Flavor</option>
                                <option value="SPECIAL">Special</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Condition Type</label>
                            <select
                                value={formData.conditionType}
                                onChange={e => setFormData({ ...formData, conditionType: e.target.value as any })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="MANUAL">Manual (Admin Only)</option>
                                <option value="FIRST_LOGIN">First Login</option>
                                <option value="LOGIN_STREAK">Login Streak</option>
                                <option value="TEAM_WIN">Team Win</option>
                                <option value="POINTS_THRESHOLD">Points Threshold</option>
                                <option value="CUSTOM">Custom Logic</option>
                            </select>
                        </div>
                        {(formData.conditionType === 'LOGIN_STREAK' || formData.conditionType === 'POINTS_THRESHOLD') && (
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Target Value</label>
                                <input
                                    type="number"
                                    value={formData.targetValue || 0}
                                    onChange={e => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.repeatable}
                                onChange={e => setFormData({ ...formData, repeatable: e.target.checked })}
                                className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                            />
                            <span className="text-sm text-gray-300">Repeatable</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                            />
                            <span className="text-sm text-gray-300">Active</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-accent-gold text-black hover:bg-yellow-400 transition-colors mt-6 shadow-lg shadow-accent-gold/20"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
