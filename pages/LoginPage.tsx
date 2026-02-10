import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register State
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { loginEmail, signupEmail, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Force Profile Selection
    const next = "/profiles";

    // Auto Redirect
    React.useEffect(() => {
        if (!authLoading && user) {
            navigate(next, { replace: true });
        }
    }, [user, authLoading, navigate, next]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginEmail(email, password);
        } catch (err: any) {
            console.error("Login Error:", err.code);
            if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
                setError("بيانات الدخول غير صحيحة");
            } else if (err.code === "auth/wrong-password") {
                setError("كلمة السر غير صحيحة");
            } else if (err.code === "auth/too-many-requests") {
                setError("محاولات كثيرة جداً. حاول مرة أخرى لاحقاً.");
            } else {
                setError("حدث خطأ غير متوقع. تأكد من اتصالك بالإنترنت.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (regPassword !== regConfirmPassword) {
            setError("كلمات السر غير متطابقة ❌");
            return;
        }

        if (regPassword.length < 6) {
            setError("كلمة السر يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        setLoading(true);
        try {
            await signupEmail(regEmail, regPassword);
            // Success -> useEffect handles redirect
        } catch (err: any) {
            console.error("Register Error:", err.code);
            if (err.code === "auth/email-already-in-use") {
                setError("هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.");
            } else {
                setError("فشل إنشاء الحساب. تأكد من البيانات.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] font-sans flex flex-col items-center justify-center relative overflow-hidden text-white direction-rtl" dir="rtl">
            <div className="z-50 w-full max-w-md p-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative">

                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/assets/brand/logo.png"
                        alt="Sobek Play"
                        className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(191,160,90,0.3)]"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6">
                    <button
                        onClick={() => { setActiveTab('login'); setError(""); }}
                        className={`flex-1 pb-3 text-sm font-bold transition-all ${activeTab === 'login'
                            ? 'text-accent-gold border-b-2 border-accent-gold'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        تسجيل الدخول
                    </button>
                    <button
                        onClick={() => { setActiveTab('register'); setError(""); }}
                        className={`flex-1 pb-3 text-sm font-bold transition-all ${activeTab === 'register'
                            ? 'text-accent-gold border-b-2 border-accent-gold'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        حساب جديد
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center animate-shake">
                        {error}
                    </div>
                )}

                {/* LOGIN FORM */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-center mb-2">أهلاً بيك من تاني! 👋</h2>
                        <div className="space-y-4">
                            <input
                                type="email"
                                required
                                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                                placeholder="البريد الإلكتروني"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                                placeholder="كلمة السر"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent-green hover:bg-[#0e7a63] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
                        >
                            {loading ? "جاري الدخول..." : "ادخل المقبرة"}
                        </button>
                    </form>
                )}

                {/* REGISTER FORM */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                        <h2 className="text-xl font-bold text-center mb-2">انضم لعائلة سوبك 🛡️</h2>
                        <div className="space-y-3">
                            <input
                                type="email"
                                required
                                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                                placeholder="البريد الإلكتروني"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                                placeholder="كلمة السر (6 أحرف على الأقل)"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                                placeholder="تأكيد كلمة السر"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent-gold text-black font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
                        >
                            {loading ? "جاري الإنشاء..." : "إنشاء حساب جديد"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => alert("تواصل مع الدعم الفني لاستعادة حسابك.")}
                        className="text-gray-500 hover:text-white transition-colors text-xs"
                    >
                        نسيت كلمة السر؟
                    </button>
                </div>
            </div>
        </div>
    );
}
// End of Login Component

