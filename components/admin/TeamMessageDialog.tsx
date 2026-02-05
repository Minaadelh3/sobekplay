import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMessageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (msg: string) => Promise<boolean>;
    teamName: string;
}

export default function TeamMessageDialog({ isOpen, onClose, onSend, teamName }: TeamMessageDialogProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        const success = await onSend(message);
        setSending(false);
        if (success) {
            setMessage('');
            onClose();
            alert("تم إرسال الرسالة لكل أعضاء الفريق ✅");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <span>📢</span> إذاعة للفريق: <span className="text-accent-gold">{teamName}</span>
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                            الرسالة دي هتظهر لكل أعضاء الفريق اللي فاتحين التطبيق دلوقتي أو لما يفتحوا.
                        </p>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب رسالتك هنا..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-accent-gold outline-none resize-none"
                            dir="rtl"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || !message.trim()}
                                className="px-6 py-2 bg-accent-gold text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? 'جاري الإرسال...' : 'إرسال 🚀'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
