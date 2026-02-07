import React, { useState } from 'react';
import { usePrayers, PrayerSection } from '../../hooks/usePrayers';
import { prayersDefaults } from '../../data/prayersDefaults';

export default function PrayersManager() {
    const { prayers, loading, updatePrayer, seedPrayers } = usePrayers();
    const [selectedPrayer, setSelectedPrayer] = useState<PrayerSection | null>(null);

    if (loading) return <div className="text-white p-10">Loading Prayers...</div>;

    return (
        <div className="p-6 md:p-12 pb-24 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Prayers & Agpeya Manager</h1>
                    <p className="text-gray-400">Edit the text content of the prayers.</p>
                </div>
                <button
                    onClick={async () => {
                        if (confirm("This will overwrite database prayers with defaults. Continue?")) {
                            await seedPrayers(prayersDefaults);
                            alert("Prayers seeded successfully!");
                        }
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm border border-white/10"
                >
                    ↻ Reset / Seed Defaults
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List */}
                <div className="w-1/3 overflow-y-auto pr-2 space-y-4">
                    {prayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            onClick={() => setSelectedPrayer(prayer)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPrayer?.id === prayer.id
                                ? 'bg-accent-gold/10 border-accent-gold text-white'
                                : 'bg-[#141414] border-white/5 text-gray-400 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{prayer.icon}</span>
                                <div>
                                    <h3 className="font-bold">{prayer.title}</h3>
                                    <p className="text-xs opacity-70">{prayer.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {prayers.length === 0 && (
                        <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl">
                            <p className="text-gray-500 mb-4">No prayers found in Database.</p>
                            <button
                                onClick={() => {
                                    // Trigger seed from a hardcoded list if implementing that feature, 
                                    // or just tell user to add manually if we add a 'Create' button.
                                    // For now just a placeholder message.
                                    alert("To seed default prayers, please run the migration script or use the 'Seed Defaults' tool if available.")
                                }}
                                className="text-accent-gold text-sm underline"
                            >
                                Seed Defaults
                            </button>
                        </div>
                    )}
                </div>

                {/* Editor */}
                <div className="flex-1 bg-[#141414] rounded-2xl border border-white/5 p-6 flex flex-col overflow-hidden">
                    {selectedPrayer ? (
                        <PrayerEditor
                            prayer={selectedPrayer}
                            onSave={async (updates) => {
                                await updatePrayer(selectedPrayer.id, updates);
                            }}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-600">
                            Select a prayer from the list to edit its content.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const PrayerEditor = ({ prayer, onSave }: { prayer: PrayerSection, onSave: (updates: Partial<PrayerSection>) => Promise<void> }) => {
    const [content, setContent] = useState(prayer.content);
    const [isDirty, setIsDirty] = useState(false);

    // Update internal state when prayer selection changes
    React.useEffect(() => {
        setContent(prayer.content);
        setIsDirty(false);
    }, [prayer.id]);

    const handleSave = async () => {
        await onSave({ content });
        setIsDirty(false);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{prayer.icon}</span>
                    <h2 className="text-2xl font-bold text-white">{prayer.title}</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`px-6 py-2 rounded-lg font-bold transition-colors ${isDirty
                        ? 'bg-accent-gold text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(191,160,90,0.4)]'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isDirty ? 'Save Changes' : 'Saved'}
                </button>
            </div>

            <textarea
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    setIsDirty(true);
                }}
                className="flex-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-6 text-white text-lg leading-relaxed font-sans outline-none focus:border-accent-gold/50 resize-none dir-rtl"
                dir="rtl"
                placeholder="Prayer content goes here..."
            />
        </div>
    );
};
