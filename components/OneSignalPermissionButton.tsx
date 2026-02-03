import React, { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

// Helper to detect iOS
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Helper to detect if running as PWA (Standalone)
const isStandalone = () => {
    return (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
};

export const OneSignalPermissionButton: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    // State for iOS instructions
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // OneSignal Init & Status Check
        async function checkStatus() {
            try {
                // Check if user is opted in (permission granted + valid token)
                const optedIn = OneSignal.User.PushSubscription.optedIn;
                setIsSubscribed(!!optedIn);

                // Listen for changes
                OneSignal.User.PushSubscription.addEventListener("change", (event) => {
                    setIsSubscribed(event.current.optedIn);
                });
            } catch (e) {
                console.warn("OneSignal status check failed", e);
            }
        }

        // Short delay to ensure SDK is loaded
        const timer = setTimeout(checkStatus, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSubscribe = async () => {
        // SPECIAL HANDLING FOR iOS
        if (isIOS() && !isStandalone()) {
            // If iOS but NOT installed -> Show instructions
            setShowIOSInstructions(true);
            return;
        }

        setLoading(true);
        try {
            console.log("🔔 Requesting OneSignal Permission...");
            // Use Slidedown prompt
            await OneSignal.Slidedown.promptPush();

            // Fallback: Check explicitly after a delay if the user just closed it
        } catch (e) {
            console.error("OneSignal Prompt Error:", e);
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
        <div className="space-y-4">
            {/* Main Status Card */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSubscribed ? 'bg-green-500/10 border-green-500/30' : 'bg-black/30 border-white/5'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {isSubscribed ? '🔔' : '🔕'}
                    </div>
                    <div>
                        <h4 className={`font-bold ${isSubscribed ? 'text-green-400' : 'text-white'}`}>
                            {isSubscribed ? 'الإشعارات مفعلة' : 'التنبيهات معطلة'}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                            {isSubscribed
                                ? 'ستصلك رسائل عن المباريات والأخبار ✅'
                                : 'اضغط تفعيل لتصلك التنبيهات'}
                        </p>
                    </div>
                </div>

                {isSubscribed ? (
                    <button
                        onClick={handleUnsubscribe}
                        disabled={loading}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                        {loading ? '...' : 'تعطيل'}
                    </button>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="bg-accent-gold hover:bg-yellow-500 text-black px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-yellow-500/20"
                    >
                        {loading ? 'جاري...' : 'تفعيل الإشعارات'}
                    </button>
                )}
            </div>

            {/* iOS Helper Message */}
            {showIOSInstructions && (
                <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-xl text-blue-200 text-sm animate-in fade-in slide-in-from-top-2">
                    <p className="font-bold mb-2">📲 لتفعيل الإشعارات على iPhone:</p>
                    <ol className="list-decimal list-inside space-y-1 opacity-90">
                        <li>اضغط على زر <strong>مشاركة (Share)</strong> في المتصفح.</li>
                        <li>اختر <strong>Add to Home Screen (إضافة للشاشة الرئيسية)</strong>.</li>
                        <li>افتح التطبيق من الشاشة الرئيسية وفعّل الإشعارات.</li>
                    </ol>
                    <button
                        onClick={() => setShowIOSInstructions(false)}
                        className="mt-3 text-xs underline opacity-70 hover:opacity-100"
                    >
                        إغلاق التعليمات
                    </button>
                </div>
            )}
        </div>
    );
};
