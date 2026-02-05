import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// 3D/Render Style Avatars with Egyptian/Middle Eastern Vibe
const EGYPTIAN_3D_AVATARS = [
    { id: 'modern_king', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg", label: "كينج العصر" },
    { id: 'queen_nef', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-long-hair_23-2149436197.jpg", label: "الملكة" }, // Long hair, confident
    { id: 'smart_guy', url: "https://img.freepik.com/free-psd/3d-illustration-business-man-with-glasses_23-2149436194.jpg", label: "المثقف" },
    { id: 'cool_hijab', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-hijab_23-2149436189.jpg", label: "البرنسيسة" }, // Assuming hijab or similar headwear if available, fallback to cap/hat one which looks generic
    { id: 'upper_egypt', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436190.jpg", label: "الزعيم" },
    { id: 'chill', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-headphones_23-2149436191.jpg", label: "الرايق" }, // Headphones
    { id: 'cleo_style', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436186.jpg", label: "ستايلش" },
    { id: 'pharaoh_vibes', url: "https://img.freepik.com/free-psd/3d-illustration-person-with-punk-hair_23-2149436198.jpg", label: "المشاكس" },
];

export default function OnboardingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    // Form State (Simplified: Name & Nickname)
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [nickname, setNickname] = useState('');

    // Avatar State
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || EGYPTIAN_3D_AVATARS[0].url);

    // Race Condition Checker
    useEffect(() => {
        if (user?.isOnboarded) {
            console.log("✅ Onboarding Sync Detected. Navigating to Profiles...");
            // Small delay to show the "Success" animation if it's running
            setTimeout(() => navigate('/profiles', { replace: true }), 1000);
        }
    }, [user?.isOnboarded, navigate]);

    const handleNext = () => {
        setAnimating(true);
        setTimeout(() => {
            if (step === 1) {
                if (!displayName.trim()) return alert("الاسم بالكامل مطلوب");
                if (!nickname.trim()) return alert("اللقب (Nickname) مطلوب");
                setStep(2);
            } else if (step === 2) {
                setStep(3);
            }
            setAnimating(false);
        }, 300); // Animation duration
    };

    const handleFinish = async (optInNotifications: boolean) => {
        if (!user) return alert("يرجى تسجيل الدخول مرة أخرى");
        setLoading(true);

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                displayName: displayName.trim(),
                nickname: nickname.trim(), // Saving Nickname
                avatarUrl: avatarUrl,
                isOnboarded: true,
                notificationsEnabled: optInNotifications,
                onboardedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            console.log("💾 Profile Saved!");

            // Allow useEffect to handle navigation, or force it if sync is slow
            setTimeout(() => {
                if (window.location.pathname === '/onboarding') {
                    navigate('/profiles', { replace: true });
                }
            }, 2000);

            if (optInNotifications && "Notification" in window) {
                Notification.requestPermission().catch(console.error);
            }

        } catch (error: any) {
            console.error("Error:", error);
            alert("حدث خطأ: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-4 font-sans text-white direction-rtl" dir="rtl">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-gold/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-green/10 blur-[150px] rounded-full mix-blend-screen delay-1000 animate-pulse-slow" />
            </div>

            <div className={`
                w-full max-w-md bg-[#121212]/90 backdrop-blur-xl p-8 rounded-[2rem] 
                border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] 
                relative overflow-hidden flex flex-col min-h-[650px] transition-all duration-500
                ${loading ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
            `}>

                {/* Progress Indicators */}
                <div className="flex gap-3 mb-10 justify-center px-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-accent-gold to-yellow-500 shadow-[0_0_10px_rgba(191,160,90,0.5)]' : 'bg-white/10'}`} />
                    ))}
                </div>

                {/* Content Container with Animation */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

                    {/* --- STEP 1: IDENTITY --- */}
                    {step === 1 && (
                        <div className="flex-1 flex flex-col">
                            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">من أنت؟ 📜</h1>
                            <p className="text-gray-400 text-center text-sm mb-8">سجل اسمك في البردية الملكية</p>

                            <div className="space-y-6 flex-1">
                                <div className="group">
                                    <label className="text-xs text-accent-gold/80 mr-2 mb-2 block font-bold transition-colors group-focus-within:text-accent-gold">الاسم بالكامل</label>
                                    <input
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/50 outline-none transition-all text-white text-right placeholder-gray-600"
                                        placeholder="مثال: مينا عادل"
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-xs text-accent-gold/80 mr-2 mb-2 block font-bold transition-colors group-focus-within:text-accent-gold">اللقب (Nickname)</label>
                                    <input
                                        type="text"
                                        required
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/50 outline-none transition-all text-white text-right placeholder-gray-600"
                                        placeholder="مثال: الملك سوبك 👑"
                                    />
                                    <p className="text-[10px] text-gray-500 mr-2 mt-1">الاسم ده اللي هيظهر لأصحابك في الشات واللعب</p>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-gradient-to-r from-accent-gold to-[#d4af37] text-black font-bold py-4 rounded-2xl mt-6 hover:shadow-[0_0_20px_rgba(191,160,90,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                التالي ⬅️
                            </button>
                        </div>
                    )}

                    {/* --- STEP 2: AVATAR --- */}
                    {step === 2 && (
                        <div className="flex-1 flex flex-col">
                            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">اختار شكلك 🕶️</h1>
                            <p className="text-gray-400 text-center text-sm mb-6">شخصيتك في العالم الافتراضي</p>

                            <div className="flex flex-col items-center gap-6 flex-1">
                                {/* Large Preview */}
                                <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-accent-gold via-white/20 to-accent-gold/10 shadow-2xl">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-black/50 backdrop-blur-sm">
                                        <img
                                            src={avatarUrl}
                                            alt="Selected"
                                            className="w-full h-full object-cover animate-fade-in"
                                        />
                                    </div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-accent-gold text-[10px] px-3 py-1 rounded-full border border-accent-gold/30 backdrop-blur-md whitespace-nowrap">
                                        {EGYPTIAN_3D_AVATARS.find(a => a.url === avatarUrl)?.label || "مختار"}
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-4 gap-3 w-full p-2">
                                    {EGYPTIAN_3D_AVATARS.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setAvatarUrl(avatar.url)}
                                            className={`
                                                aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 relative group
                                                ${avatarUrl === avatar.url
                                                    ? 'border-accent-gold scale-100 shadow-[0_0_15px_rgba(191,160,90,0.3)] opacity-100'
                                                    : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105 bg-white/5'
                                                }
                                            `}
                                        >
                                            <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-gradient-to-r from-accent-gold to-[#d4af37] text-black font-bold py-4 rounded-2xl mt-6 hover:shadow-[0_0_20px_rgba(191,160,90,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                دي شخصيتي! كمل ⬅️
                            </button>
                        </div>
                    )}

                    {/* --- STEP 3: FINAL --- */}
                    {step === 3 && (
                        <div className="flex-1 flex flex-col text-center justify-between">
                            <div className="mt-12 flex flex-col items-center">
                                <div className="w-28 h-28 bg-gradient-to-tr from-accent-green/20 to-accent-green/5 rounded-full flex items-center justify-center mb-8 ring-1 ring-accent-green/30 animate-pulse-slow">
                                    <span className="text-6xl drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">🔔</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-3">خليك في قلب الحدث</h1>
                                <p className="text-gray-400 text-sm px-6 leading-relaxed">
                                    عايز يوصلك تنبيهات لما التيم بتاعك يكسب أو تنزل مسابقة جديدة؟
                                </p>
                            </div>

                            <div className="space-y-4 mb-4">
                                <button
                                    onClick={() => handleFinish(true)}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-accent-gold to-[#d4af37] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_25px_rgba(191,160,90,0.5)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            <span>جاري تجهيز بروفايلك...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>✅</span>
                                            <span>أكيد، فعل التنبيهات</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleFinish(false)}
                                    disabled={loading}
                                    className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl text-sm hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/10"
                                >
                                    لا، خليني أدخل بصمت 🤫
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
