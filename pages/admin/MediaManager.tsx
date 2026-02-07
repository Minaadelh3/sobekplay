import React, { useState } from 'react';
import { useMedia } from '../../hooks/useMedia';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../../types';

export default function MediaManager() {
    const { posters, mediaMeta, loading, updateMediaMeta } = useMedia();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

    const filteredPosters = posters.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-white p-10">Loading Media Library...</div>;

    return (
        <div className="p-6 md:p-12 pb-24">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Media Library</h1>
                    <p className="text-gray-400">Manage metadata, visibility, and tags for movies and series.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search titles..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent-gold outline-none w-64"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredPosters.map((poster) => (
                    <div
                        key={poster.id}
                        onClick={() => setSelectedPoster(poster)}
                        className={`group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${poster.isHidden ? 'border-red-500/50 grayscale' : 'border-transparent hover:border-accent-gold'
                            }`}
                    >
                        <img src={poster.src} alt={poster.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-0 left-0 p-4 w-full">
                            <h3 className="text-white font-bold text-sm truncate">{poster.title}</h3>
                            <div className="flex gap-2 text-[10px] text-gray-300">
                                <span>{poster.type}</span>
                                {poster.isFeatured && <span className="text-accent-gold">★ Featured</span>}
                            </div>
                        </div>

                        {poster.isHidden && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">HIDDEN</div>
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedPoster && (
                    <MediaEditModal
                        poster={selectedPoster}
                        onClose={() => setSelectedPoster(null)}
                        onSave={async (id, updates) => {
                            await updateMediaMeta(id, updates);
                            setSelectedPoster(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const MediaEditModal = ({ poster, onClose, onSave }: { poster: PosterItem, onClose: () => void, onSave: (id: string, updates: any) => Promise<void> }) => {
    const [formData, setFormData] = useState({
        customTitle: poster.customTitle || poster.title,
        customDescription: poster.customDescription || poster.description || '',
        isHidden: poster.isHidden || false,
        isFeatured: poster.isFeatured || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Only save fields that are actually overrides (don't save if same as default ideally, but simpler to just save config)
        await onSave(poster.id, formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex"
            >
                {/* Poster Preview */}
                <div className="w-1/3 relative hidden md:block">
                    <img src={poster.src} className="w-full h-full object-cover" />
                </div>

                {/* Form */}
                <div className="flex-1 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Edit Meta: <span className="text-accent-gold">{poster.id}</span></h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Title</label>
                            <input
                                value={formData.customTitle}
                                onChange={e => setFormData({ ...formData, customTitle: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={formData.customDescription}
                                onChange={e => setFormData({ ...formData, customDescription: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none resize-none"
                            />
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.isHidden ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                                    {formData.isHidden && '✓'}
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.isHidden} onChange={e => setFormData({ ...formData, isHidden: e.target.checked })} />
                                <span className="group-hover:text-white text-gray-400">Hide from App</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-accent-gold border-accent-gold text-black' : 'border-white/20'}`}>
                                    {formData.isFeatured && '✓'}
                                </div>
                                <input type="checkbox" className="hidden" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                                <span className="group-hover:text-white text-gray-400">Featured</span>
                            </label>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">Save Updates</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
