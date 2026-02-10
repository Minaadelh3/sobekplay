
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import PushComposer from '../../components/admin/push/PushComposer';
import AudienceSelector from '../../components/admin/push/AudienceSelector';
import PushScheduler from '../../components/admin/push/PushScheduler';
import PushHistory from '../../components/admin/push/PushHistory';
import SubscribedUsersList from '../../components/admin/push/SubscribedUsersList';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

const PushNotifications: React.FC = () => {
    const { sendPush, schedulePush, loading, error } = usePushNotifications();
    const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'users'>('compose');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        url: '',
        imageUrl: ''
    });

    const [audience, setAudience] = useState<any>({ type: 'All' });
    const [sendAfter, setSendAfter] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSend = async () => {
        if (!confirm("Are you sure you want to send this push notification?")) return;

        setSuccessMsg(null);
        try {
            const payload = { ...formData, audience, sendAfter };

            if (sendAfter) {
                await schedulePush(payload);
                setSuccessMsg("Notification Scheduled Successfully! 📅");
            } else {
                await sendPush(payload);
                setSuccessMsg("Notification Sent Successfully! 🚀");
            }
        } catch (err: any) {
            console.error("Failed to send push:", err);
            // Error is handled in hook, but we can double check
        }
    };

    const handleTriggerSubscription = async () => {
        if (!confirm("⚠️ Are you sure? This will pop up on EVERY user's screen asking them to subscribe.")) return;

        try {
            await setDoc(doc(db, 'system_states', 'notifications'), {
                triggerTimestamp: serverTimestamp(),
                triggeredBy: auth.currentUser?.uid
            });
            setSuccessMsg("Subscription Request Broadcasted! 📡");
        } catch (e) {
            console.error(e);
            alert("Failed to trigger subscription request.");
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Push Notifications</h1>
                    <p className="text-gray-400">Manage targeting, schedule campaigns, and track delivery.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleTriggerSubscription}
                        className="px-4 py-2 rounded-lg font-bold transition-all bg-white/5 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/10 hover:border-accent-gold"
                    >
                        🔔 Ask Users to Subscribe
                    </button>
                    <div className="w-px bg-white/10 mx-2"></div>
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'compose' ? 'bg-accent-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-accent-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-accent-gold text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        Subscribed Users
                    </button>
                </div>
            </div>

            {/* Error / Success Messages */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
                    <span>❌</span> {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-center gap-2">
                    <span>✅</span> {successMsg}
                </div>
            )}

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {activeTab === 'compose' ? (
                    <>
                        <div className="lg:col-span-2 space-y-8">
                            <PushComposer formData={formData} setFormData={setFormData} />
                            <AudienceSelector audience={audience} setAudience={setAudience} />
                            <PushScheduler sendAfter={sendAfter} setSendAfter={setSendAfter} />
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            {/* Mobile Preview */}
                            <div className="bg-white p-4 rounded-xl text-black shadow-xl border-4 border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-accent-gold rounded flex items-center justify-center text-[10px] font-bold text-white">SP</div>
                                        <span className="text-xs font-bold text-gray-600">Sobek Play • Now</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm mb-1 leading-tight">{formData.title || 'Notification Title'}</h4>
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-snug">{formData.message || 'Notification content will appear here...'}</p>
                                    </div>
                                    {formData.imageUrl && (
                                        <img src={formData.imageUrl} className="w-12 h-12 rounded object-cover bg-gray-200" alt="" />
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 sticky top-24">
                                <h3 className="text-lg font-bold text-white mb-4">📢 Campaign Summary</h3>
                                <ul className="space-y-3 text-sm text-gray-400 mb-6 font-mono">
                                    <li className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Audience:</span>
                                        <span className="text-white text-right truncate max-w-[150px]">{audience.type}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Target Count:</span>
                                        <span className="text-accent-gold">~ Est. Reach</span>
                                    </li>
                                    <li className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Schedule:</span>
                                        <span className="text-white">{sendAfter ? new Date(sendAfter).toLocaleString() : 'Immediately'}</span>
                                    </li>
                                </ul>

                                <div className="space-y-3">
                                    <button
                                        onClick={async () => {
                                            if (audience.type === 'Test') {
                                                // TEST MODE: Get ID + Send
                                                try {
                                                    // V16 SDK Support Only
                                                    // @ts-ignore
                                                    let playerId = window.OneSignal?.User?.PushSubscription?.id;

                                                    if (!playerId) {
                                                        console.log("Player ID not found immediately, waiting...");
                                                        await new Promise(r => setTimeout(r, 2000));
                                                        // @ts-ignore
                                                        playerId = window.OneSignal?.User?.PushSubscription?.id;
                                                    }

                                                    if (!playerId) {
                                                        alert("Could not detect your Push ID.\n\n1. Ensure you have clicked 'Subscribe' or accepted permissions.\n2. Disable AdBlockers.\n3. Try refreshing the page.");
                                                        return;
                                                    }

                                                    if (!confirm("Send Test to Device ID: " + playerId)) return;

                                                    const testPayload = { ...formData, audience: { ...audience, include_player_ids: [playerId] } };
                                                    await sendPush(testPayload);
                                                    setSuccessMsg("Test Sent! 🧪");
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Test Failed: " + (e instanceof Error ? e.message : String(e)));
                                                }
                                            } else {
                                                // NORMAL MODE
                                                handleSend();
                                            }
                                        }}
                                        disabled={loading || !formData.title || !formData.message}
                                        className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${audience.type === 'Test' ? 'bg-white text-black hover:bg-gray-200' : 'bg-accent-gold text-black hover:bg-yellow-400 hover:shadow-accent-gold/20'}`}
                                    >
                                        {loading ? 'Processing...' : (audience.type === 'Test' ? '🧪 Send Test (Me Only)' : (sendAfter ? 'Schedule Campaign 📅' : '🚀 Send Blast'))}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'history' ? (
                    <div className="lg:col-span-3">
                        <PushHistory />
                    </div>
                ) : (
                    <div className="lg:col-span-3">
                        <SubscribedUsersList />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PushNotifications;
