import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, signupEmail, loginWithGoogle } = useAuth(); // signupEmail is now available
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to PROFILES instead of app
    const next = location?.state?.from ?? "/profiles";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signupEmail(email, password);
            }
            navigate(next, { replace: true });
        } catch (err: any) {
            console.error("Auth Failed:", err);
            setError(isLogin ? "عفواً، هناك خطأ في البريد أو كلمة السر" : "فشل إنشاء الحساب، ربما البريد مستخدم بالفعل");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate(next, { replace: true });
        } catch (err: any) {
            console.error("Google Login Failed:", err);
            setError("فشل تسجيل الدخول بجوجل");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] font-sans flex flex-col items-center justify-center relative overflow-hidden text-white direction-rtl">
            {/* Cinematic Background with Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#08111A] via-[#0B5D4B]/30 to-[#070A0F] z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0 pointer-events-none" />

            <div className="z-50 w-full max-w-md p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative">
                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/assets/brand/logo.png"
                        alt="Sobek Play"
                        className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(191,160,90,0.3)]"
                    />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
                    {isLogin ? "أهلاً بيك في سوبك بلاي" : "انضم لعائلة سوبك"}
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm">
                    {isLogin ? "سجل دخولك عشان تبدأ رحلتك" : "سجل حساب جديد وابدأ المنافسة"}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-right"
                            placeholder="البريد الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
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
                        className="w-full bg-accent-green hover:bg-[#0e7a63] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (isLogin ? "ادخل المقبرة" : "إنشاء الحساب")}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[#0B0F14]/90 text-gray-500">أو</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.065 0 12 0 7.31 0 3.256 2.744 1.378 6.822l3.888 2.943z"
                        />
                        <path
                            fill="#34A853"
                            d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-3.898 3.214C4.169 22.977 7.747 24 12 24c4.664 0 8.57-2.601 10.375-6.082l-3.792-2.914a7.202 7.202 0 0 1-2.544 3.01z"
                        />
                        <path
                            fill="#4A90E2"
                            d="M19.834 21.457a8.667 8.667 0 0 0 3.482-7.169c0-.952-.092-2.096-.282-3.096H12v4.8h6.49c-.218 1.547-1.157 3.328-2.639 4.39l3.983 2.073z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.277 14.268A7.127 7.127 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.378 6.822A11.957 11.957 0 0 0 0 12c0 1.92.445 3.719 1.233 5.313l4.044-3.045z"
                        />
                    </svg>
                    <span>{isLogin ? "تسجيل الدخول بجوجل" : "انضم باستخدام جوجل"}</span>
                </button>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? "لسه جديد؟" : "عندك حساب بالفعل؟"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-accent-gold hover:text-white transition-colors underline bg-transparent border-0 cursor-pointer p-0 font-bold"
                        >
                            {isLogin ? "اعمل حساب دلوقتي" : "سجل دخولك"}
                        </button>
                    </p>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="absolute bottom-4 text-center w-full z-10">
                <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-50">
                    Powered by Sobek Play
                </p>
            </div>

            {/* DEBUG OVERLAY (Temporary) */}
            <div className="absolute top-0 left-0 p-2 text-[10px] text-green-400 bg-black/80 max-w-[200px] z-[100] pointer-events-none font-mono">
                <p>Debug Status v3:</p>
                <p>UA: {navigator.userAgent.slice(0, 30)}...</p>
                <p>Localhost: {window.location.hostname.includes('192') || window.location.hostname.includes('local') ? 'Yes' : 'No'}</p>
                <p>Protocol: {window.location.protocol}</p>
            </div>
        </div>
    );
}
