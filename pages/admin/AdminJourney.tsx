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
        <div className="space-y-6 lg:space-y-8 text-right" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 text-xs lg:text-sm">
                {/* Config Panel */}
                <div className="bg-black/30 p-4 lg:p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-4">⚙️ إعدادات الرحلة</h3>

                    <div>
                        <label className="block text-gray-400 text-[10px] lg:text-xs mb-1">تاريخ البداية (Day 1)</label>
                        <input
                            type="date"
                            value={config.startDate}
                            onChange={e => setConfig({ ...config, startDate: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-accent-gold"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-4 py-3 rounded-xl w-full active:bg-white/10 transition-colors">
                            <input
                                type="checkbox"
                                checked={config.isActive}
                                onChange={e => setConfig({ ...config, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20 bg-black/50 text-accent-gold focus:ring-accent-gold"
                            />
                            <span className="text-white font-bold text-xs lg:text-sm">تفعيل النظام (Active)</span>
                        </label>
                    </div>

                    <button
                        onClick={saveConfig}
                        disabled={loading}
                        className="w-full py-3.5 bg-accent-gold text-black font-bold rounded-xl hover:bg-yellow-500 transition-all active:scale-95 shadow-lg"
                    >
                        حفظ الإعدادات
                    </button>
                </div>

                {/* Actions Panel */}
                <div className="bg-black/30 p-4 lg:p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-2 lg:mb-4">🛠️ أدوات التحكم</h3>

                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold rounded-xl hover:bg-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>🌱</span> إنشاء الإنجازات (Seed)
                    </button>

                    <div className="pt-4 border-t border-white/5">
                        <label className="block text-gray-500 text-[10px] lg:text-xs mb-2">تجربة (Simulation)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select
                                value={testUserId}
                                onChange={e => setTestUserId(e.target.value)}
                                className="flex-1 bg-black/50 border border-white/10 p-3 rounded-xl text-white text-xs lg:text-sm outline-none focus:border-accent-gold appearance-none"
                            >
                                <option value="">اختر مستخدم...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.displayName}</option>)}
                            </select>
                            <button
                                onClick={handleSimulate}
                                disabled={loading || !testUserId}
                                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-xs lg:text-sm active:scale-95 transition-all shadow-lg"
                            >
                                جرب 🎮
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Program Content Overrides */}
            <div className="bg-[#121820] p-4 lg:p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">📝 تعديل محتوى البرنامج</h3>

                {loadingOverrides ? (
                    <div className="text-center py-8 text-white/50 text-xs lg:text-sm animate-pulse">Loading overrides...</div>
                ) : (
                    <div className="space-y-3 lg:space-y-4">
                        {EPISODES.map(episode => (
                            <div key={episode.id}>
                                <button
                                    onClick={() => setExpandedEpisodeId(expandedEpisodeId === episode.id ? null : episode.id)}
                                    className="w-full flex justify-between items-center p-3 lg:p-4 bg-black/30 rounded-xl border border-white/10 hover:bg-black/40 transition-all active:bg-black/50"
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="font-bold text-white text-sm lg:text-base">EPISODE 0{episode.id}: {episode.title}</span>
                                        <span className={`text-[10px] font-bold ${overrides[episode.id]?.enabled ? 'text-green-500' : 'text-gray-500'}`}>
                                            {overrides[episode.id]?.enabled ? '🟢 تم التعديل' : '⚪ افتراضي'}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 transform transition-transform group-hover:translate-x-1">
                                        {expandedEpisodeId === episode.id ? '🔼' : '🔽'}
                                    </span>
                                </button>

                                {expandedEpisodeId === episode.id && (
                                    <div className="pt-4 animate-in fade-in slide-in-from-top-2">
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
            <div className="bg-[#121820] p-4 lg:p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">خريطة الأيام</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                    {JOURNEY_ACHIEVEMENTS_DATA.map(day => (
                        <div key={day.day} className="bg-black/30 p-4 lg:p-5 rounded-xl border border-white/10 text-center hover:border-accent-gold/30 transition-colors">
                            <div className="text-2xl lg:text-3xl mb-2 lg:mb-3">{day.icon}</div>
                            <div className="text-accent-gold font-bold text-[10px] lg:text-xs mb-1">يوم {day.day}</div>
                            <div className="text-white font-bold text-sm lg:text-base mb-1 truncate">{day.name}</div>
                            <div className="text-[10px] text-gray-500 mt-2 font-mono">+{day.points} XP</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

