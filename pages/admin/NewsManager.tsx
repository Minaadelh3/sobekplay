import React, { useState } from 'react';
import { useNews } from '../../hooks/useNews';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem } from '../../types';
import { newsDefaults } from '../../data/newsDefaults';

export default function NewsManager() {
    const { news, loading, addNews, updateNews, deleteNews, reorderNews } = useNews();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

    // Seed function
    const handleSeed = async () => {
        if (confirm("Seed default news? This will add duplicates if they exist.")) {
            for (const item of newsDefaults) {
                await addNews(item);
            }
        }
    };

    if (loading) return <div className="text-white p-10">Loading News...</div>;


    const handleEdit = (item: NewsItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this news item?")) {
            await deleteNews(id);
        }
    };

    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 md:p-12 pb-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">News Feed Manager</h1>
                    <p className="text-gray-400">Manage announcements, news, and jokes for the News Page.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeed}
                        className="bg-white/5 text-white font-bold px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        ↻ Seed
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent-gold text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Add News
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {news.map((item) => (
                    <div key={item.id} className="bg-[#141414] border border-white/5 p-6 rounded-2xl flex items-start gap-4 hover:border-white/10 transition-colors group">
                        <div className="text-4xl bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.content}</p>
                            <div className="mt-3 flex gap-2 text-xs font-mono text-gray-600">
                                <span>ID: {item.id}</span>
                                <span>•</span>
                                <span>Order: {item.order}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors">✏️</button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <NewsModal
                        item={editingItem}
                        onClose={closeModal}
                        onSave={async (data) => {
                            if (editingItem) {
                                await updateNews(editingItem.id, data);
                            } else {
                                await addNews(data);
                            }
                            closeModal();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const NewsModal = ({ item, onClose, onSave }: { item: NewsItem | null, onClose: () => void, onSave: (data: any) => Promise<void> }) => {
    const [formData, setFormData] = useState({
        title: item?.title || '',
        content: item?.content || '',
        icon: item?.icon || '📰',
        order: item?.order || 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a1a1a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
                <form onSubmit={handleSubmit}>
                    <div className="bg-black/50 p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">
                            {item ? 'Edit News' : 'New News Item'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                placeholder="e.g. Breaking News"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Icon (Emoji)</label>
                            <input
                                required
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                placeholder="e.g. 🚀"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Content</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none resize-none"
                                placeholder="Write the news content here..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order Priority</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-black/50 p-6 border-t border-white/5 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-accent-gold text-black font-bold hover:bg-yellow-400 transition-colors">Save Item</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
