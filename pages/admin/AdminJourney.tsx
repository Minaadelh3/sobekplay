import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { seedJourneyAchievements, checkJourneyProgress, JOURNEY_CONFIG_ID, JOURNEY_ACHIEVEMENTS_DATA } from '../../services/journeyService';
import { useAdminData } from '../../hooks/useAdminData';
import { EPISODES } from '../../pages/ProgramPage';
import { useProgramOverrides, EpisodeOverride } from '../../hooks/useProgramOverrides';
import { ProgramEpisodeEditor } from '../../components/admin/ProgramEpisodeEditor';

export default function AdminJourney() {
    const { users } = useAdminData();
    const { overrides, loading: loadingOverrides, saveOverride, resetOverride } = useProgramOverrides();

    const [config, setConfig] = useState<any>({ startDate: '', isActive: false });
    const [loading, setLoading] = useState(false);
    const [testUserId, setTestUserId] = useState('');
    const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        const snap = await getDoc(doc(db, 'system_config', JOURNEY_CONFIG_ID));
        if (snap.exists()) {
            setConfig(snap.data());
        }
    };

    const saveConfig = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, 'system_config', JOURNEY_CONFIG_ID), config);
            alert("✅ Settings Saved");
        } catch (e) {
            alert("Error saving");
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        await seedJourneyAchievements();
        setLoading(false);
        alert("✅ Journey Achievements Seeded");
    };

    const handleSimulate = async () => {
        if (!testUserId) return alert("Select a user");
        setLoading(true);
        await checkJourneyProgress(testUserId);
        setLoading(false);
        alert("✅ Check Ran (See Console/Toast for result)");
    };

    const handleSaveOverride = async (episodeId: number, data: EpisodeOverride) => {
        const success = await saveOverride(episodeId, data);
        if (success) alert(`✅ Episode ${episodeId} Updated`);
        else alert("❌ Error updating episode");
    };

    const handleResetOverride = async (episodeId: number) => {
        const success = await resetOverride(episodeId);
        if (success) alert(`✅ Episode ${episodeId} Reset`);
        else alert("❌ Error resetting episode");
    };

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Config Panel */}
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">⚙️ إعدادات الرحلة</h3>

                    <div>
                        <label className="block text-gray-400 text-xs mb-1">تاريخ البداية (Day 1)</label>
                        <input
                            type="date"
                            value={config.startDate}
                            onChange={e => setConfig({ ...config, startDate: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-4 py-2 rounded-xl">
                            <input
                                type="checkbox"
                                checked={config.isActive}
                                onChange={e => setConfig({ ...config, isActive: e.target.checked })}
                            />
                            <span className="text-white font-bold">تفعيل النظام (Active)</span>
                        </label>
                    </div>

                    <button
                        onClick={saveConfig}
                        disabled={loading}
                        className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors"
                    >
                        حفظ الإعدادات
                    </button>
                </div>

                {/* Actions Panel */}
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">🛠️ أدوات التحكم</h3>

                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold rounded-xl hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🌱</span> إنشاء الإنجازات (Seed)
                    </button>

                    <div className="pt-4 border-t border-white/5">
                        <label className="block text-gray-500 text-xs mb-2">تجربة (Simulation)</label>
                        <div className="flex gap-2">
                            <select
                                value={testUserId}
                                onChange={e => setTestUserId(e.target.value)}
                                className="flex-1 bg-black/50 border border-white/10 p-2 rounded-lg text-white text-xs"
                            >
                                <option value="">اختر مستخدم...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.displayName}</option>)}
                            </select>
                            <button
                                onClick={handleSimulate}
                                disabled={loading || !testUserId}
                                className="px-4 bg-purple-600 text-white rounded-lg font-bold text-xs"
                            >
                                جرب 🎮
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Program Content Overrides */}
            <div className="bg-[#121820] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">📝 تعديل محتوى البرنامج (Overrides)</h3>

                {loadingOverrides ? (
                    <div className="text-center py-8 text-white/50">Loading overrides...</div>
                ) : (
                    <div className="space-y-4">
                        {EPISODES.map(episode => (
                            <div key={episode.id}>
                                <button
                                    onClick={() => setExpandedEpisodeId(expandedEpisodeId === episode.id ? null : episode.id)}
                                    className="w-full flex justify-between items-center p-4 bg-black/30 rounded-xl border border-white/10 hover:bg-black/40 transition-colors"
                                >
                                    <span className="font-bold text-white">EPISODE 0{episode.id}: {episode.title}</span>
                                    <span className="text-xs text-gray-500">
                                        {overrides[episode.id]?.enabled ? '🟢 OVERRIDE ACTIVE' : '⚪ DEFAULT'}
                                    </span>
                                </button>

                                {expandedEpisodeId === episode.id && (
                                    <div className="pt-4 animate-fadeIn">
                                        <ProgramEpisodeEditor
                                            episode={episode}
                                            overrides={overrides[episode.id]} // Pass specific override for this episode
                                            onSave={handleSaveOverride}
                                            onReset={handleResetOverride}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-[#121820] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">خريطة الأيام</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {JOURNEY_ACHIEVEMENTS_DATA.map(day => (
                        <div key={day.day} className="bg-black/30 p-4 rounded-xl border border-white/10 text-center">
                            <div className="text-2xl mb-2">{day.icon}</div>
                            <div className="text-accent-gold font-bold text-sm mb-1">يوم {day.day}</div>
                            <div className="text-white font-bold">{day.name}</div>
                            <div className="text-xs text-gray-500 mt-2">+{day.points} SP</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

