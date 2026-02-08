import React, { useState } from 'react';
import { useOneSignal } from '../../hooks/useOneSignal';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PushNotifications = () => {
    const { permission, enableNotifications, isSupported, subscriptionId } = useOneSignal();
    const [tagKey, setTagKey] = useState('');
    const [tagValue, setTagValue] = useState('');

    const handleAddTag = () => {
        if (!tagKey || !tagValue) return;
        // Client-side tagging only
        // @ts-ignore
        if (window.OneSignal) {
            // @ts-ignore
            window.OneSignal.User.addTag(tagKey, tagValue);
            alert(`Tag Added: ${tagKey} = ${tagValue}`);
            setTagKey('');
            setTagValue('');
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 min-h-screen pb-20 text-white">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black mb-2 tracking-tight flex items-center gap-3">
                    <Bell className="w-8 h-8 text-accent-gold" />
                    Push Notifications
                </h1>
                <p className="text-gray-400">
                    Manage your client-side notification settings.
                    <br />
                    <span className="text-yellow-500 font-bold">Note:</span> Sending notifications is now done via the OneSignal Dashboard or automatically by the system (client-side triggers).
                </p>
            </div>

            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0F1218] border border-white/5 rounded-3xl p-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Device Status</h2>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${permission === 'granted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {permission === 'granted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {permission.toUpperCase()}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">OneSignal ID</div>
                        <div className="font-mono text-sm break-all text-blue-400">
                            {subscriptionId || 'Not Subscribed / Loading...'}
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Browser Support</div>
                        <div className="font-mono text-sm text-gray-300">
                            {isSupported ? 'Supported ✅' : 'Not Supported ❌'}
                        </div>
                    </div>

                    {permission !== 'granted' && isSupported && (
                        <button
                            onClick={enableNotifications}
                            className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl hover:scale-[1.02] transition-transform"
                        >
                            Enable Notifications
                        </button>
                    )}

                    {permission === 'granted' && (
                        <div className="text-center text-sm text-gray-500 mt-4">
                            You are ready to receive notifications! 🚀
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Tagging Section (Client Side Only) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0F1218] border border-white/5 rounded-3xl p-8"
            >
                <h2 className="text-xl font-bold mb-6">User Tags (Client-Side)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Tag Key (e.g. role)"
                        value={tagKey}
                        onChange={e => setTagKey(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold"
                    />
                    <input
                        type="text"
                        placeholder="Tag Value (e.g. admin)"
                        value={tagValue}
                        onChange={e => setTagValue(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold"
                    />
                    <button
                        onClick={handleAddTag}
                        disabled={!tagKey || !tagValue}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Tag
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    These tags are sent directly to OneSignal from your browser. No backend involved.
                </p>
            </motion.div>

            {/* Information Section */}
            <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                <h3 className="text-blue-400 font-bold mb-2">How to Send Notifications?</h3>
                <p className="text-sm text-gray-300">
                    To send a push notification to users, please use the
                    <a href="https://dashboard.onesignal.com" target="_blank" rel="noreferrer" className="text-accent-gold hover:underline mx-1">
                        OneSignal Dashboard
                    </a>.
                    Select your audience using the tags above or send to everyone.
                </p>
            </div>
        </div>
    );
};

export default PushNotifications;
