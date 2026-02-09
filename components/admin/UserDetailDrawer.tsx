import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminUser } from '../../hooks/useAdminData';
import { useAdminData } from '../../hooks/useAdminData';
import { TEAMS } from '../../types/auth'; // Static teams for reference
import UserAvatar from '../UserAvatar';
import PointsControlPanel from './PointsControlPanel';
import AdminUserProgression from './AdminUserProgression';
import PasswordResetDialog from './PasswordResetDialog';
import { db } from '../../lib/firebase';
import { doc, updateDoc, deleteDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/permissions';

interface UserDetailDrawerProps {
    user: AdminUser;
    onClose: () => void;
    onUpdate: () => void;
    teams: any[];
}

export default function UserDetailDrawer({ user, onClose, onUpdate, teams }: UserDetailDrawerProps) {
    const { user: adminUser } = useAuth();
    const { toggleUserStatus, assignTeam, updateUserName, assignRole, updateUserStats } = useAdminData();
    const [name, setName] = useState(user.name || '');
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [loading, setLoading] = useState(false);

    // Points Modal State
    const [showPointsPanel, setShowPointsPanel] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    // Identity Save
    const handleIdentitySave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await updateUserName(user.id, name);
            // Also update displayName if changed
            if (displayName !== user.displayName) {
                await updateDoc(doc(db, 'users', user.id), { displayName });
                await setDoc(doc(collection(db, 'admin_logs')), {
                    action: 'UPDATE_USER_IDENTITY',
                    targetUid: user.id,
                    adminId: adminUser?.id, // Fix: uid -> id
                    details: { oldName: user.name, newName: name, newDisplay: displayName },
                    timestamp: serverTimestamp()
                });
            }
            alert("تم حفظ البيانات بنجاح ✅");
            onUpdate();
        } catch (e) {
            alert("فشل الحفظ");
        } finally {
            setLoading(false);
        }
    };

    // Danger Zone Actions
    const handleSuspend = async () => {
        const action = user.isDisabled ? "activation" : "suspension";
        const reason = prompt(`اكتب سبب ${action === 'suspension' ? 'الإيقاف' : 'التفعيل'} (إجباري):`);
        if (!reason) return;

        if (!confirm(`هل أنت متأكد من ${user.isDisabled ? 'تفعيل' : 'إيقاف'} هذا الحساب؟`)) return;

        await toggleUserStatus(user.id, !!user.isDisabled);

        // Log extra detail
        await setDoc(doc(collection(db, 'admin_logs')), {
            action: user.isDisabled ? 'ACTIVATE_USER' : 'SUSPEND_USER',
            targetUid: user.id,
            adminId: adminUser?.id, // Fix: uid -> id
            reason: reason,
            timestamp: serverTimestamp()
        });

        alert(user.isDisabled ? "تم تفعيل الحساب ✅" : "تم إيقاف الحساب ⛔");
        onUpdate();
    };

    const handleDelete = async () => {
        if (!confirm("⚠️ تحذير خطير!\n\nهل أنت متأكد من حذف هذا المستخدم نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه!")) return;

        const confirmText = prompt("للتأكيد، اكتب 'حذف' :");
        if (confirmText !== 'حذف') return;

        try {
            // Soft delete or Hard delete? Requirement says "Delete Permanently"
            // But strict systems usually soft delete. Let's do a strict hard delete marker for now 
            // but keep data for audit if needed, or actually delete doc. 
            // Prompt implies "Delete Permanently", let's mark deleted:true and disable auth.

            await updateDoc(doc(db, 'users', user.id), {
                deleted: true,
                isDisabled: true,
                deletedAt: serverTimestamp(),
                deletedBy: adminUser?.id // Fix: uid -> id
            });

            await setDoc(doc(collection(db, 'admin_logs')), {
                action: 'DELETE_USER_PERMANENT',
                targetUid: user.id,
                adminId: adminUser?.id, // Fix: uid -> id
                timestamp: serverTimestamp()
            });

            alert("تم حذف المستخدم من النظام.");
            onClose();
            onUpdate();
        } catch (e) {
            alert("فشل الحذف");
        }
    };

    const handleSendMessage = () => {
        const msg = prompt("نص الرسالة (هتظهر للمستخدم باسم 'SOBEK'):");
        if (!msg) return;

        // Implement System Message
        setDoc(doc(collection(db, 'system_messages')), {
            sender: "SOBEK",
            title: "إشعار إداري",
            message: msg,
            targetType: "user",
            targetId: user.id,
            createdAt: serverTimestamp(),
            read: false
        }).then(() => alert("تم إرسال الرسالة بنجاح 📩"));
    };

    return (
        <>
            <AnimatePresence>
                {showPointsPanel && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md">
                            <PointsControlPanel
                                targetId={user.id}
                                targetName={user.name || 'User'}
                                targetType="USER"
                                currentPoints={user.xp || 0}
                                onSuccess={() => { onUpdate(); setShowPointsPanel(false); }}
                                onClose={() => setShowPointsPanel(false)}
                            />
                        </motion.div>
                    </div>
                )}
                {showPasswordReset && (
                    <PasswordResetDialog
                        isOpen={showPasswordReset}
                        onClose={() => setShowPasswordReset(false)}
                        targetUserId={user.id}
                        targetUserName={user.name || user.displayName || 'User'}
                    />
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide-over Panel */}
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-[#141414] border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start bg-[#0F1218]">
                    <div className="flex items-center gap-4">
                        <UserAvatar src={user.avatar || user.photoURL} name={user.name} size="lg" className="ring-2 ring-accent-gold/50" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{user.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${user.role?.includes('ADMIN') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                    {user.role || 'AGENT'}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Quick Tools */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleSendMessage}
                            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-lg text-sm text-gray-300 transition-colors"
                        >
                            <span>💬</span> إرسال رسالة
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-lg text-sm text-gray-300 transition-colors">
                            <span>📄</span> سجل النشاط
                        </button>
                    </div>

                    {/* Identity Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-2">
                            👤 الهوية والبيانات
                        </h3>
                        <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">الاسم الكامل</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent-gold outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 mb-1">Display Name (الاسم الظاهر)</label>
                                <input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent-gold outline-none text-sm"
                                />
                            </div>
                            <button
                                onClick={handleIdentitySave}
                                disabled={loading}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded border border-white/5 text-gray-300"
                            >
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>

                            <div className="pt-2 border-t border-white/5">
                                <label className="block text-[10px] text-gray-400 mb-1">البريد الإلكتروني</label>
                                <input disabled value={user.email} className="w-full bg-transparent border-0 px-0 text-gray-500 cursor-not-allowed text-sm font-mono" />
                                <p className="text-[10px] text-red-500/50 mt-1">⚠️ الإيميل مربوط بنظام الدخول ومينفعش يتغير من هنا.</p>
                            </div>
                        </div>
                    </section>

                    {/* Roles & Permissions Section - ONLY UNCLE JOY TEAM */}
                    {can(adminUser, 'manage_users') && adminUser?.teamId === 'uncle_joy' && (
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                🛡️ الصلاحيات (Admin Access)
                            </h3>
                            <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                                <label className="block text-[10px] text-purple-300 mb-2 font-bold">Role Assignment</label>
                                <select
                                    value={user.role || 'USER'}
                                    onChange={async (e) => {
                                        await assignRole(user.id, e.target.value);
                                        onUpdate();
                                    }}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-3 py-3 text-white focus:border-purple-500 outline-none text-sm font-bold"
                                >
                                    <option value="USER">USER (Standard)</option>
                                    <option value="VIEWER">VIEWER (Read Only)</option>
                                    <option value="GAMES_MODERATOR">GAMES MODERATOR</option>
                                    <option value="POINTS_MANAGER">POINTS MANAGER</option>
                                    <option value="ADMIN">ADMIN (Full Access)</option>
                                    <option value="SUPER_ADMIN">⚡ SUPER ADMIN (God Mode)</option>
                                </select>
                                <p className="text-[10px] text-purple-400/60 mt-2">
                                    تنبيه: تغيير الصلاحيات بيدي المستخدم تحكم في أدوات "Uncle Joy".
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Organization Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-2">
                            🏢 التنظيم والفريق
                        </h3>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <label className="block text-[10px] text-gray-400 mb-2">الفريق الحالي</label>

                            {adminUser?.teamId === 'uncle_joy' ? (
                                <>
                                    <select
                                        value={user.teamId || ''}
                                        onChange={async (e) => {
                                            if (!confirm("هل أنت متأكد من نقل العضو لفريق آخر؟")) return;
                                            await assignTeam(user.id, e.target.value);
                                            onUpdate();
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-3 text-white focus:border-accent-gold outline-none text-sm mb-2"
                                    >
                                        <option value="">بدون فريق (Freelancer)</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {TEAMS.find(st => st.id === t.id)?.name || t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-500">نقل العضو هيأثر على نقاط الفريق.</p>
                                </>
                            ) : (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-bold flex items-center gap-2">
                                    <span>🔒</span>
                                    <span>نقل الأعضاء متاح فقط لفريق "Uncle Joy"</span>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* PROGRESSION - NEW SECTION */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                            📊 التاريخ والإنجازات
                        </h3>
                        <AdminUserProgression userId={user.id} userName={user.name || 'User'} unlockedIds={user.unlockedAchievements || []} />
                    </section>

                    {/* Points & XP - DIRECT EDIT MODE */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-accent-gold uppercase tracking-wider flex items-center gap-2">
                                ⚡ الرصيد والخبرة (Direct Edit)
                            </h3>
                            {can(adminUser, 'adjust_points') && (
                                <button
                                    onClick={() => setShowPointsPanel(true)}
                                    className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-1 rounded hover:bg-accent-gold hover:text-black transition-colors"
                                >
                                    ⚙️ Transaction Mode
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <label className="block text-[10px] text-gray-400 mb-1 font-bold">Score / XP (Official Rank)</label>
                                <input
                                    type="number"
                                    value={user.xp || 0}
                                    onChange={async (e) => {
                                        const x = parseInt(e.target.value);
                                        if (!isNaN(x)) {
                                            // Unified Update: Sync both XP and Points
                                            await updateUserStats(user.id, { xp: x, points: x });
                                            onUpdate();
                                        }
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xl font-mono font-bold text-accent-gold outline-none focus:border-accent-gold"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500">
                            تنبيه: التعديل هنا بيسمع فوراً في الداتا بيز (Direct DB Force).
                        </p>
                    </section>

                    {/* Danger Zone */}
                    <section className="space-y-4 pt-6 mt-6 border-t border-white/5">
                        <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                            ☠️ منطقة الخطر
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowPasswordReset(true)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🔒</span> إعادة تعيين كلمة المرور (Reset Password)
                            </button>

                            <button
                                onClick={handleSuspend}
                                className={`w-full py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${user.isDisabled
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                <span>{user.isDisabled ? '♻️' : '⛔'}</span>
                                {user.isDisabled ? 'تفعيل الحساب (Reactivate)' : 'إيقاف المستخدم (Suspend)'}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="w-full py-3 bg-red-900/20 text-red-400 border border-red-500/30 rounded-xl text-sm hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🗑️</span> حذف نهائي من النظام
                            </button>
                            <p className="text-[10px] text-center text-gray-600">كل الإجراءات دي بتتسجل في سجل الرقابة.</p>
                        </div>
                    </section>

                </div>
            </motion.div>
        </>
    );
}
