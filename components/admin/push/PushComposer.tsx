
import React from 'react';

interface PushComposerProps {
    formData: any;
    setFormData: (data: any) => void;
}

const PushComposer: React.FC<PushComposerProps> = ({ formData, setFormData }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Compose Notification 🔔</h3>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="...Enter title"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold text-right"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest">Message</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="...Enter message"
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold text-right"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Image URL (Optional)</label>
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="...//:https"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold text-center"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Launch URL (Optional)</label>
                    <input
                        type="text"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="...//:https"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold text-center"
                    />
                </div>
            </div>
        </div>
    );
};

export default PushComposer;
