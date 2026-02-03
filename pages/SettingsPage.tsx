import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { db, app } from '../lib/firebase';
import { useOneSignal } from '../hooks/useOneSignal'; // Import hook

const storage = getStorage(app);

import { isIOS, isPWA } from '../lib/authActions';

// Sub-component for Notifications
function NotificationSection() {
    const { enableNotifications, subscriptionId, permission, isSupported, isInitialized } = useOneSignal();

    // --- State Logic ---
    const isIOSMobile = isIOS();
    const isPWAMode = isPWA();

    // State 1: Not Supported (e.g. specialized browsers, old OS)
    if (!isSupported && !isIOSMobile) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">⚠️</span>
                    <h3 className="text-lg font-bold text-white">غير مدعوم</h3>
                </div>
                <p className="text-gray-400 text-sm">
                    جهازك أو متصفحك لا يدعم الإشعارات حالياً.
                </p>
            </div>
        );
    }

    // State 2: iOS but Not Installed (Add to Home Screen required first)
    // iOS Safari only supports Push if installed as PWA (iOS 16.4+)
    if (isIOSMobile && !isPWAMode) {
        return (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 mt-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">📲</span>
                    <h3 className="text-lg font-bold text-white">نزل التطبيق أولاً</h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                    عشان تستقبل الإشعارات على الآيفون، لازم تثبت التطبيق على الشاشة الرئيسية الأول.
                </p>
                <div className="text-xs text-blue-300 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    1. اضغط على زر <b>مشاركة (Share)</b> في المتصفح<br />
                    2. اختر <b>Add to Home Screen</b>
                </div>
            </div>
        );
    }

    // State 3: Permission Denied (Blocked)
    if (permission === 'denied') {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mt-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">🚫</span>
                    <h3 className="text-lg font-bold text-white">الإشعارات محظورة</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                    لقد قمت بمنع الإشعارات سابقاً. لتفعيلها، يجب السماح بها من إعدادات جهازك.
                </p>
                <div className="text-xs text-red-300">
                    {isIOSMobile
                        ? "اذهب إلى الإعدادات > Sobek > الإشعارات > تفعيل"
                        : "اذهب إلى إعدادات المتصفح (القفل بجوار الرابط) > تفعيل الإشعارات"}
                </div>
            </div>
        );
    }

    // State 5 & 6: Enabled or Default
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{subscriptionId ? '🔔' : '🔕'}</span>
                        <h3 className="text-lg font-bold text-white">الإشعارات</h3>
                    </div>
                    {subscriptionId && (
                        <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                            ACTIVE
                        </span>
                    )}
                </div>

                <p className="text-gray-400 text-sm mb-6 max-w-sm">
                    {subscriptionId
                        ? 'أنت جاهز تماماً! هيوصلك كل جديد عن التحديات والمسابقات.'
                        : 'فعل الإشعارات عشان يوصلك كل جديد وتتابع نقاطك أول بأول.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">الحالة</span>
                        <span className={`text-sm font-bold ${subscriptionId ? 'text-green-400' : 'text-gray-400'}`}>
                            {subscriptionId ? 'مفعلة ✅' : 'غير مفعلة'}
                        </span>
                    </div>

                    {!subscriptionId && (
                        <button
                            type="button"
                            onClick={enableNotifications}
                            className="bg-accent-gold hover:bg-yellow-500 text-black px-6 py-2 rounded-lg text-sm font-bold transition shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)]"
                        >
                            تفعيل الآن
                        </button>
                    )}

                    {subscriptionId && (
                        <button
                            type="button"
                            className="bg-white/10 text-gray-400 px-6 py-2 rounded-lg text-sm font-bold cursor-default border border-white/5"
                        >
                            تم التفعيل
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { user, firebaseUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            // Ideally sync phone from Firestore user doc
            if (user.mobile) setPhoneNumber(user.mobile);
        }
    }, [user]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !firebaseUser) return;

        setUploading(true);
        try {
            // 2. Upload
            const storageRef = ref(storage, `avatars/${firebaseUser.uid}/profile.jpg`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 3. Update Firestore
            // Note: Our AuthContext listens to 'users/{uid}'.
            await updateDoc(doc(db, "users", firebaseUser.uid), {
                avatarUrl: downloadURL
            });

            // Should auto-update UI via AuthContext subscription

        } catch (error) {
            console.error("Upload failed", error);
            alert("فشل رفع الصورة. حاول مرة تانية.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", firebaseUser.uid), {
                name: name,
                mobile: phoneNumber
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen pt-24 pb-24">
            <h1 className="text-3xl font-bold text-white mb-8 border-r-4 border-accent-gold pr-4">
                الإعدادات ⚙️
            </h1>

            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Photo Section */}
                    <div className="flex items-center gap-6 mb-8">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold relative">
                                <img
                                    src={user?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                                    alt="Profile"
                                    className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : ''}`}
                                />
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <span className="text-xs font-bold text-white">📷 تغيير</span>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-accent-gold text-xs mt-2 underline"
                            >
                                تغيير الصورة الشخصية
                            </button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">
                            الاسم
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-gold focus:outline-none transition"
                        />
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">
                            رقم الهاتف (اختياري)
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="012xxxxxxxx"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-gold focus:outline-none transition"
                        />
                    </div>

                    {/* Notification Settings */}
                    <NotificationSection />


                    <div className="pt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all
                                ${loading ? 'bg-gray-600' : 'bg-accent-gold hover:bg-yellow-500 text-black'}
                            `}
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                    </div>

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-center"
                        >
                            تم حفظ بياناتك بنجاح ✅
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
}
