import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../lib/firebase'; // Ensure app is exported from here

interface PasswordResetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: string;
    targetUserName: string;
}

export default function PasswordResetDialog({ isOpen, onClose, targetUserId, targetUserName }: PasswordResetDialogProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        setError(null);

        // Validation
        if (!newPassword || newPassword.length < 6) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("كلمات المرور غير متطابقة");
            return;
        }

        setLoading(true);

        try {
            // Initialize Functions with specific region if needed
            // Default often works, but explicit 'us-central1' prevents region mismatch errors
            const functions = getFunctions(app, 'us-central1');
            const resetUserPassword = httpsCallable(functions, 'resetUserPassword');

            await resetUserPassword({ targetUid: targetUserId, newPassword: newPassword });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setNewPassword('');
                setConfirmPassword('');
            }, 2000);
        } catch (err: any) {
            console.error("Password Reset Failed", err);

            // Map Firebase Errors to User Friendly Messages
            if (err.code === 'functions/permission-denied') {
                setError("⛔ ليس لديك صلاحية للقيام بهذا الإجراء.");
            } else if (err.code === 'functions/unauthenticated') {
                setError("🔒 الرجاء تسجيل الدخول أولاً.");
            } else if (err.code === 'functions/invalid-argument') {
                setError("❌ بيانات غير صحيحة (طول كلمة المرور).");
            } else {
                setError(err.message || "❌ فشل تغيير كلمة المرور. حاول مرة أخرى.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-md bg-[#1A1D24] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                🔒 تغيير كلمة المرور
                            </h2>
                            <p className="text-xs text-gray-400 mb-6">
                                للمستخدم: <span className="text-accent-gold font-bold">{targetUserName}</span>
                            </p>

                            {success ? (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg text-center mb-4">
                                    <p className="font-bold">تم تغيير كلمة المرور بنجاح ✅</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] text-gray-400 mb-1">كلمة المرور الجديدة</label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent-gold outline-none text-sm font-mono"
                                            placeholder="New Password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-400 mb-1">تأكيد كلمة المرور</label>
                                        <input
                                            type="text"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent-gold outline-none text-sm font-mono"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                {!success && (
                                    <button
                                        onClick={handleReset}
                                        disabled={loading}
                                        className={`flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? <span className="animate-spin">⏳</span> : '🔄 تحديث كلمة المرور'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
