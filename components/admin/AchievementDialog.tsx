import React, { useState, useEffect } from 'react';
import { Achievement, AchievementCategory } from '../../types/achievements';

interface AchievementDialogProps {
    achievement?: Achievement | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function AchievementDialog({ achievement, onClose, onSave }: AchievementDialogProps) {
    const [formData, setFormData] = useState<Partial<Achievement>>({
        title: '',
        description: '',
        xp: 0,
        emoji: '🏆',
        category: 'Discovery',
        type: 'one_time',
        trigger: { event: 'manual' },
        repeatable: false,
        visible: true
    });
    const [loading, setLoading] = useState(false);

    // Temp state for trigger event editing
    const [triggerEvent, setTriggerEvent] = useState('manual');

    useEffect(() => {
        if (achievement) {
            setFormData(achievement);
            setTriggerEvent(achievement.trigger?.event || 'manual');
        }
    }, [achievement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Merge trigger event
            const finalData = {
                ...formData,
                trigger: { ...formData.trigger, event: triggerEvent }
            };
            await onSave(finalData);
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
                            <label className="block text-xs text-gray-400 mb-1">Emoji / Icon</label>
                            <input
                                type="text"
                                value={formData.emoji}
                                onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-center text-2xl"
                                placeholder="🏆"
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-xs text-gray-400 mb-1">Title (Arabic preferred)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
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

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">How to Get (Hint)</label>
                        <input
                            type="text"
                            value={formData.how_to_get || ''}
                            onChange={e => setFormData({ ...formData, how_to_get: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            placeholder="e.g. افتح الباب"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">XP Value</label>
                            <input
                                type="number"
                                value={formData.xp}
                                onChange={e => setFormData({ ...formData, xp: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as AchievementCategory })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="Onboarding">Onboarding</option>
                                <option value="Daily">Daily</option>
                                <option value="Discovery">Discovery</option>
                                <option value="Games">Games</option>
                                <option value="Community">Community</option>
                                <option value="Profile">Profile</option>
                                <option value="Special">Special</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Trigger Event Code</label>
                            <input
                                type="text"
                                value={triggerEvent}
                                onChange={e => setTriggerEvent(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono text-xs"
                                placeholder="e.g. user_login"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="one_time">One Time</option>
                                <option value="daily">Daily</option>
                                <option value="progressive">Progressive</option>
                                <option value="admin">Admin Manual</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'progressive' && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Target Count</label>
                            <input
                                type="number"
                                value={formData.target || 0}
                                onChange={e => setFormData({ ...formData, target: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono"
                            />
                        </div>
                    )}


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
                                checked={formData.visible}
                                onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                                className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                            />
                            <span className="text-sm text-gray-300">Visible</span>
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
