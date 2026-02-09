
import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

const PushHistory: React.FC = () => {
    const { getHistory } = usePushNotifications();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getHistory()
            .then(data => setHistory(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="text-center py-10 text-gray-400">Loading History...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">📜 Sent History</h2>
            {history.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10 text-gray-500">
                    No notifications sent yet.
                </div>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-white">{item.title}</h4>
                            <p className="text-gray-400 text-sm">{item.message}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300">
                                    Target: {item.target?.type || 'Unknown'}
                                </span>
                                {item.scheduledFor && (
                                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                        Scheduled: {new Date(item.scheduledFor).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm font-bold ${item.status === 'sent' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {item.status?.toUpperCase() || 'SENT'}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(item.sentAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default PushHistory;
