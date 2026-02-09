
import React from 'react';

interface PushSchedulerProps {
    sendAfter: string;
    setSendAfter: (date: string) => void;
}

const PushScheduler: React.FC<PushSchedulerProps> = ({ sendAfter, setSendAfter }) => {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Schedule (Optional) 📅</h3>
            <input
                type="datetime-local"
                value={sendAfter}
                onChange={(e) => setSendAfter(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold"
                min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-2">Leave empty to send immediately.</p>
        </div>
    );
};

export default PushScheduler;
