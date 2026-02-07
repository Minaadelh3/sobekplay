import React, { useState, useEffect } from 'react';
import { Episode } from '../../pages/ProgramPage';
import { useProgramOverrides, EpisodeOverride } from '../../hooks/useProgramOverrides';

interface ProgramEpisodeEditorProps {
    episode: Episode;
    overrides?: EpisodeOverride;
    onSave: (id: number, data: EpisodeOverride) => void;
    onReset: (id: number) => void;
}

export const ProgramEpisodeEditor: React.FC<ProgramEpisodeEditorProps> = ({ episode, overrides, onSave, onReset }) => {
    const defaultData: EpisodeOverride = {
        enabled: false,
        title: episode.title,
        subtitle: episode.subtitle,
        intro: episode.intro,
        date: episode.date,
        details: episode.details ? [...episode.details] : []
    };

    const [data, setData] = useState<EpisodeOverride>(defaultData);
    const [isSourceLoaded, setIsSourceLoaded] = useState(false);

    // Sync with overrides when they load
    useEffect(() => {
        if (overrides) {
            setData(overrides);
            setIsSourceLoaded(true);
        } else {
            // If no specific override exists for this episode, we can prep the form with default values 
            // but keep enabled false.
            setData(defaultData);
        }
    }, [overrides, episode]);

    const handleFieldChange = (field: keyof EpisodeOverride, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleTimelineChange = (index: number, field: 'time' | 'event', value: string) => {
        const newTimeline = [...data.details];
        newTimeline[index] = { ...newTimeline[index], [field]: value };
        setData(prev => ({ ...prev, details: newTimeline }));
    };

    const addTimelineItem = () => {
        setData(prev => ({
            ...prev,
            details: [...prev.details, { time: '', event: '' }]
        }));
    };

    const removeTimelineItem = (index: number) => {
        setData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        onSave(episode.id, data);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset this episode to default content?')) {
            onReset(episode.id);
            setData(defaultData);
        }
    };

    // If source isn't loaded (from hook), maybe show loader or just form. 
    // Effect handles it.

    return (
        <div className="bg-[#121820] border border-white/5 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                        EPISODE 0{episode.id}
                    </span>
                    <h3 className="text-xl font-bold text-white">{episode.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                        <input
                            type="checkbox"
                            checked={data.enabled}
                            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                            className="accent-accent-gold"
                        />
                        <span className={`text-sm font-bold ${data.enabled ? 'text-accent-gold' : 'text-gray-500'}`}>
                            {data.enabled ? 'Override ACTIVE' : 'Default Mode'}
                        </span>
                    </label>
                </div>
            </div>

            {data.enabled && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Main Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-500 text-xs mb-1">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => handleFieldChange('title', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 text-xs mb-1">Location Line</label>
                            <input
                                type="text"
                                value={data.date}
                                onChange={e => handleFieldChange('date', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold/50 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-500 text-xs mb-1">Subtitle</label>
                            <input
                                type="text"
                                value={data.subtitle}
                                onChange={e => handleFieldChange('subtitle', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold/50 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-gray-500 text-xs mb-1">Tagline (Intro) - Max 1 Line</label>
                            <input
                                type="text"
                                value={data.intro}
                                onChange={e => handleFieldChange('intro', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white focus:border-accent-gold/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Timeline Editor */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-gray-400 text-xs font-bold uppercase">Timeline Events</label>
                            <button
                                onClick={addTimelineItem}
                                className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors"
                            >
                                + Add Row
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.details.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <div className="w-24 flex-shrink-0">
                                        <input
                                            type="text"
                                            value={item.time}
                                            placeholder="Time"
                                            onChange={e => handleTimelineChange(idx, 'time', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-blue-300 text-center"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={item.event}
                                            placeholder="Event details..."
                                            onChange={e => handleTimelineChange(idx, 'event', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeTimelineItem(idx)}
                                        className="text-red-500/50 hover:text-red-500 p-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            Reset to Default
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-black hover:bg-gray-200 transition-colors"
                        >
                            💾 Save Changes
                        </button>
                    </div>
                </div>
            )}

            {!data.enabled && (
                <div className="text-center py-4 text-gray-600 text-sm italic">
                    Default content is currently displayed. Enable override to edit.
                </div>
            )}
        </div>
    );
};
