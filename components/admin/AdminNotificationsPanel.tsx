import React, { useState } from 'react';
import { NotificationService, NotificationType } from '../../services/NotificationService';
import { useAdminData } from '../../hooks/useAdminData'; // Assuming this exists or similar hook for users

export const AdminNotificationsPanel: React.FC = () => {
    const { users } = useAdminData();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/');
    const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const handleSend = async () => {
        if (!title || !body) return alert("Title and Body are required.");

        // Define Target
        let targetIds: string[] = [];
        if (targetType === 'ALL') {
            targetIds = users.map(u => u.id);
        } else {
            targetIds = selectedUserIds;
        }

        if (targetIds.length === 0) return alert("No users selected.");

        if (!confirm(`Are you sure you want to send to ${targetIds.length} users?`)) return;

        setLoading(true);
        setLastResult(null);

        try {
            const result = await NotificationService.send({
                userIds: targetIds,
                title,
                body,
                url,
                type: 'ADMIN_MANUAL'
            });

            setLastResult(result.data);
            alert(`Sent! Success: ${result.data.success}, Skipped: ${result.data.skipped}`);
        } catch (e) {
            console.error(e);
            alert("Failed to send.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#141414] p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                📢 Push Notification Center
            </h2>

            <div className="space-y-4">
                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., New Challenge Available!"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Deep Link (URL)</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="/games/new-game"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">Body Message</label>
                    <textarea
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-24"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Detailed message here..."
                    />
                </div>

                {/* Target Selector */}
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Target Audience</label>
                    <div className="flex gap-4 mb-3">
                        <button
                            onClick={() => setTargetType('ALL')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold ${targetType === 'ALL' ? 'bg-accent-gold text-black' : 'bg-gray-800 text-gray-400'}`}
                        >
                            All Users ({users.length})
                        </button>
                        <button
                            onClick={() => setTargetType('SPECIFIC')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold ${targetType === 'SPECIFIC' ? 'bg-accent-gold text-black' : 'bg-gray-800 text-gray-400'}`}
                        >
                            Specific User
                        </button>
                    </div>

                    {targetType === 'SPECIFIC' && (
                        <select
                            multiple
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-32"
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, option => option.value);
                                setSelectedUserIds(options);
                            }}
                        >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Sending...' : '🚀 Send Notification'}
                    </button>
                </div>

                {/* Result Log */}
                {lastResult && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-xl text-sm font-mono">
                        <p className="text-green-400">Success: {lastResult.success}</p>
                        <p className="text-red-400">Failed: {lastResult.failed}</p>
                        <p className="text-yellow-400">Skipped (Rules): {lastResult.skipped}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
