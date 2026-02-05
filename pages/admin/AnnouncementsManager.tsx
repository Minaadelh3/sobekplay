import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../hooks/useAdminData';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAMS } from '../../types/auth';

export default function AnnouncementsManager() {
    const { user } = useAuth();
    const { teams } = useAdminData(); // Reuse existing hook for teams list

    // Feed State
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('INFO'); // INFO, WARNING, MISSION
    const [targetType, setTargetType] = useState('ALL'); // ALL, TEAM, USER
    const [targetId, setTargetId] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Fetch recent system messages
            const q = query(collection(db, "system_messages"), orderBy("createdAt", "desc"), limit(20));
            const snap = await getDocs(q);
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (targetType === 'TEAM' && !targetId) return alert("اختار الفريق الأول!");
        if (targetType === 'USER' && !targetId) return alert("اكتب ID المستخدم!");

        try {
            await addDoc(collection(db, "system_messages"), {
                title,
                message,
                type,
                sender: "SOBEK", // Hardcoded as per rules
                targetType,
                targetId: targetType === 'ALL' ? 'GLOBAL' : targetId,
                createdAt: serverTimestamp(),
                adminId: user?.id,
                readBy: []
            });

            // Log it
            await addDoc(collection(db, "admin_logs"), {
                action: "SEND_SYSTEM_MESSAGE",
                adminId: user?.id,
                targetType,
                targetId,
                timestamp: serverTimestamp()
            });

            setShowCreate(false);
            setTitle('');
            setMessage('');
            setTargetType('ALL');
            fetchMessages();
            alert("تم إرسال الرسالة بنجاح 📡");
        } catch (e) {
            console.error(e);
            alert("فشل الإرسال.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("مسح الرسالة دي؟")) return;
        await deleteDoc(doc(db, "system_messages", id));
        fetchMessages();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📡</span> مركز البث (Sobek Broadcast)
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">إرسال رسايل وتنبيهات لكل المستخدمين أو لفرق محددة.</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-accent-gold text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-accent-gold/20"
                >
                    <span>+</span> رسالة جديدة
                </button>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSend}
                        className="bg-[#141414] p-6 rounded-xl border border-white/10 space-y-4 shadow-2xl"
                    >
                        <h3 className="font-bold text-white text-lg border-b border-white/5 pb-2">تفاصيل الرسالة</h3>

                        {/* Targeting */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 font-bold mb-1">المستقبلين (Target)</label>
                                <select
                                    value={targetType} onChange={e => { setTargetType(e.target.value); setTargetId(''); }}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                >
                                    <option value="ALL">الكل (Global Broadcast)</option>
                                    <option value="TEAM">فريق محدد</option>
                                    <option value="USER">عضو محدد (Direct)</option>
                                </select>
                            </div>

                            {targetType === 'TEAM' && (
                                <div>
                                    <label className="block text-xs text-gray-400 font-bold mb-1">اختار الفريق</label>
                                    <select
                                        value={targetId} onChange={e => setTargetId(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    >
                                        <option value="">-- اختار الفريق --</option>
                                        {teams.length > 0 ? teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        )) : TEAMS.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {targetType === 'USER' && (
                                <div>
                                    <label className="block text-xs text-gray-400 font-bold mb-1">User ID</label>
                                    <input
                                        value={targetId} onChange={e => setTargetId(e.target.value)}
                                        placeholder="دخل الـ ID بتاع المستخدم"
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none font-mono"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 font-bold mb-1">عنوان الرسالة</label>
                                <input
                                    value={title} onChange={e => setTitle(e.target.value)} required
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    placeholder="مثلاً: تحديث هام في المهام"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 font-bold mb-1">نوع الرسالة</label>
                                <select
                                    value={type} onChange={e => setType(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                >
                                    <option value="INFO">ℹ️ معلومة (Info)</option>
                                    <option value="WARNING">⚠️ تحذير (Warning)</option>
                                    <option value="MISSION">🎯 مهمة جديدة (Mission)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 font-bold mb-1">نص الرسالة</label>
                            <textarea
                                value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                                className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none resize-none"
                                placeholder="اكتب التفاصيل هنا..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-500 hover:text-white">إلغاء</button>
                            <button type="submit" className="px-8 py-2 bg-accent-gold text-black font-bold rounded-lg hover:bg-yellow-400 shadow-lg shadow-accent-gold/10">
                                📡 إرسال البث
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-gray-500 font-bold text-sm tracking-wider uppercase mb-4">أرشيف الرسايل (Last 20)</h3>
                {loading ? <div className="text-center text-gray-500">جاري التحميل...</div> :
                    messages.length === 0 ? <div className="text-center text-gray-600 py-12">مفيش رسايل متبعتة حالياً.</div> :
                        messages.map(msg => (
                            <div key={msg.id} className="bg-[#141414] p-4 rounded-xl border border-white/5 relative group flex gap-4 items-start hover:border-white/10 transition-colors">
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${msg.type === 'WARNING' ? 'bg-red-500' :
                                    msg.type === 'MISSION' ? 'bg-accent-gold' : 'bg-blue-500'
                                    }`} />

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{msg.title}</h4>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5 mb-2">
                                                TO: <span className="text-gray-300">{msg.targetType} {msg.targetId !== 'GLOBAL' && `(${msg.targetId})`}</span>
                                                {' • '}
                                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('ar-EG') : 'Just now'}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(msg.id)} className="text-gray-600 hover:text-red-500 transition-colors">🗑️</button>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        ))}
            </div>
        </div>
    );
}
