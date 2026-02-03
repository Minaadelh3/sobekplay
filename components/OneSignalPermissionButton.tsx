import React, { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export const OneSignalPermissionButton: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check initial status
        async function checkStatus() {
            try {
                // Wait for OneSignal to be ready if called too early
                // Note: react-onesignal usually handles the instance globally
                const state = OneSignal.User.PushSubscription.optedIn;
                setIsSubscribed(!!state);

                // Listen for changes
                OneSignal.User.PushSubscription.addEventListener("change", (event) => {
                    setIsSubscribed(event.current.optedIn);
                });
            } catch (e) {
                console.warn("OneSignal status check failed", e);
            }
        }
        checkStatus();
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            console.log("🔔 Requesting OneSignal Permission...");
            // Slidedown prompt is the recommended modern way
            await OneSignal.Slidedown.promptPush();
        } catch (e) {
            console.error("OneSignal Prompt Error:", e);
            // Fallback if slidedown not configured/fails
            try {
                // Native fallback (deprecated but useful)
                // await OneSignal.Notifications.requestPermission(); 
            } catch (err) { }
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (confirm("هل أنت متأكد من إيقاف الإشعارات؟")) {
            setLoading(true);
            try {
                await OneSignal.User.PushSubscription.optOut();
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
            <div>
                <h4 className="text-white font-bold">تنبيهات OneSignal</h4>
                <p className="text-xs text-gray-400 mt-1">
                    {isSubscribed
                        ? 'الإشعارات مفعلة ✅'
                        : 'احصل على آخر التنبيهات والأخبار 🔔'}
                </p>
            </div>

            {isSubscribed ? (
                <button
                    onClick={handleUnsubscribe}
                    disabled={loading}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                    {loading ? 'جاري...' : 'تعطيل'}
                </button>
            ) : (
                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="bg-[#E54C3C] hover:bg-[#C0392B] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(229,76,60,0.3)] hover:shadow-[0_0_20px_rgba(229,76,60,0.5)]"
                >
                    {loading ? 'جاري...' : 'اشتراك الآن'}
                </button>
            )}
        </div>
    );
};
