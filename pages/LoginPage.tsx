import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, signupEmail, loginWithGoogle, user, loading: authLoading } = useAuth(); // Access user & loading
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to PROFILES instead of app
    const rawNext = location?.state?.from ?? "/profiles";
    // Loop Safeguard: Never redirect to login if we are already there
    const next = rawNext === "/login" ? "/profiles" : rawNext;

    // 1. AUTO-REDIRECT IF ALREADY LOGGED IN
    React.useEffect(() => {
        if (!authLoading && user) {
            // Instant redirect for premium feel
            navigate(next, { replace: true });
        }
    }, [user, authLoading, navigate, next]);

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
            // Navigation handled by useEffect above or AuthContext flow
        } catch (err: any) {
            console.error("Auth Failed:", err);
            setError(isLogin ? "عفواً، هناك خطأ في البريد أو كلمة السر" : "فشل إنشاء الحساب، ربما البريد مستخدم بالفعل");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            // This promise might effectively never resolve if redirect happens
            await loginWithGoogle();
            // If Popup used (desktop), we end up here.
            // If Redirect used (mobile/PWA), page reloads -> AuthContext -> useEffect above handles redirect.
        } catch (err: any) {
            console.error("Google Login Failed:", err);
            setError("فشل تسجيل الدخول بجوجل");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] font-sans flex flex-col items-center justify-center relative overflow-hidden text-white direction-rtl">
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
                        className="w-full bg-accent-green hover:bg-[#0e7a63] text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                        {loading ? (
                            <>
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white relative z-10"></div>
                                <span className="relative z-10">جاري الدخول...</span>
                            </>
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
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    {loading ? (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    ) : null}
                    <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
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
                    <span className="relative z-10">{loading ? "جاري التحميل..." : (isLogin ? "تسجيل الدخول بجوجل" : "انضم باستخدام جوجل")}</span>
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
            {/* Clean Footer - No Dev Artifacts */}
        </div>
    );
}

