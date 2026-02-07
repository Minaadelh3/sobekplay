import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Section, SettingsInput } from '../components/settings/SettingsComponents';
import Toast from '../components/Toast';
import { AvatarManager } from '../components/settings/AvatarManager';
import MobileBackHeader from '../components/MobileBackHeader';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const {
        updateProfile,
        deleteAccountStart
    } = useSettings();

    // Notifications Hook
    const {
        permission,
        fcmToken,
        registerToken,
        unregisterToken,
        loading: pushLoading,
        isSupported: pushSupported
    } = usePushNotifications();

    // UI State
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error', visible: boolean }>({ msg: '', type: 'success', visible: false });
    const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type, visible: true });

    // Local State
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [mobile, setMobile] = useState('');

    // Dirty Check State
    const [initialState, setInitialState] = useState({ name: '', nickname: '', mobile: '' });

    // Sync local state when user updates (e.g. initial load)
    useEffect(() => {
        if (user) {
            const currentName = user.profile?.fullName || user.name || '';
            const currentNickname = user.profile?.nickname || user.profile?.displayName || '';
            const currentMobile = user.profile?.mobile || user.mobile || '';

            setName(currentName);
            setNickname(currentNickname);
            setMobile(currentMobile);

            setInitialState({
                name: currentName,
                nickname: currentNickname,
                mobile: currentMobile
            });
        }
    }, [user]);

    const hasChanges = name !== initialState.name || nickname !== initialState.nickname || mobile !== initialState.mobile;

    // --- Handlers ---
    const handleProfileSave = async () => {
        if (!name.trim()) {
            showToast("يرجى إدخال الاسم بالكامل", 'error');
            return;
        }

        const success = await updateProfile({
            fullName: name,
            displayName: nickname || name, // Fallback to name if nickname is empty for display purposes
            nickname: nickname,
            mobile: mobile
        });

        if (success) {
            showToast("تم تحديث البيانات بنجاح ✅", 'success');
            setInitialState({ name, nickname, mobile });
        } else {
            showToast("حدث خطأ أثناء التحديث", 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] pb-24 md:pb-12 text-white font-sans" dir="rtl">
            <MobileBackHeader title="الإعدادات" />

            {/* Desktop Header spacer */}
            <div className="hidden md:block h-24" />
            <div className="md:hidden h-16" />

            <div className="max-w-2xl mx-auto px-4 space-y-8">
                <Toast
                    message={toast.msg}
                    type={toast.type}
                    isVisible={toast.visible}
                    onClose={() => setToast({ ...toast, visible: false })}
                />

                {/* --- Profile Section --- */}
                <Section title="الملف الشخصي" icon="👤">
                    <AvatarManager
                        userProfile={user?.profile}
                        onUpdate={updateProfile}
                        showToast={showToast}
                    />

                    <div className="mt-8 grid gap-5">
                        <SettingsInput
                            label="الاسم بالكامل"
                            value={name}
                            onChange={setName}
                            placeholder="الاسم الثلاثي"
                            icon="📝"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <SettingsInput
                                label="اسم الشهرة (Nickname)"
                                value={nickname}
                                onChange={setNickname}
                                placeholder="الاسم المفضل للعرض"
                                icon="🌟"
                            />
                            <SettingsInput
                                label="رقم الموبايل"
                                value={mobile}
                                onChange={setMobile}
                                placeholder="01xxxxxxxxx"
                                icon="📱"
                                type="tel"
                            />
                        </div>

                        {/* Read Only Email */}
                        <div className="opacity-60 pointer-events-none">
                            <SettingsInput
                                label="البريد الإلكتروني"
                                value={user?.email || ''}
                                onChange={() => { }}
                                icon="📧"
                                disabled
                            />
                        </div>

                        {hasChanges && (
                            <div className="animate-fade-in pt-2">
                                <button
                                    onClick={handleProfileSave}
                                    className="w-full bg-accent-gold text-black px-6 py-4 rounded-xl font-bold hover:bg-yellow-500 transition shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-2"
                                >
                                    <span>💾</span> حفظ التغييرات
                                </button>
                            </div>
                        )}
                    </div>
                </Section>

                {/* --- Notifications Section --- */}
                <Section title="إدارة التنبيهات" icon="🔔">
                    {!pushSupported ? (
                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-300 text-sm">
                            ⚠️ المتصفح الحالي لا يدعم التنبيهات.
                        </div>
                    ) : (
                        <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-bold text-blue-100">حالة الإشعارات</h4>
                                    <p className="text-xs text-blue-300/60 mt-1">
                                        {fcmToken ? 'التنبيهات مفعلة وتعمل بنجاح' : 'لم يتم تفعيل التنبيهات بعد'}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded border font-bold ${fcmToken ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-gray-500 text-gray-400'}`}>
                                    {fcmToken ? 'نشط ✅' : 'غير نشط ⛔'}
                                </span>
                            </div>

                            {!fcmToken ? (
                                <button
                                    onClick={registerToken}
                                    disabled={pushLoading}
                                    className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm w-full font-bold hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-900/20"
                                >
                                    {pushLoading ? 'جاري التفعيل...' : 'تفعيل التنبيهات'}
                                </button>
                            ) : (
                                <button
                                    onClick={unregisterToken}
                                    disabled={pushLoading}
                                    className="bg-transparent border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm w-full hover:bg-red-900/10 transition disabled:opacity-50"
                                >
                                    إيقاف التنبيهات
                                </button>
                            )}

                            {permission === 'denied' && (
                                <p className="text-xs text-red-400 mt-3 bg-red-500/10 p-2 rounded">
                                    ⚠️ تم حظر التنبيهات من إعدادات المتصفح. يرجى السماح بها من الإعدادات لتفعيلها.
                                </p>
                            )}
                        </div>
                    )}
                </Section>

                <div className="mt-8 px-4 flex flex-col gap-4">
                    <button
                        onClick={logout}
                        className="w-full py-4 text-center text-gray-400 font-bold bg-[#121212] rounded-xl border border-white/5 hover:bg-white/5 transition hover:text-white"
                    >
                        تسجيل الخروج
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف الحساب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
                                deleteAccountStart();
                            }
                        }}
                        className="text-xs text-red-500/50 hover:text-red-500 transition self-center"
                    >
                        حذف الحساب نهائياً
                    </button>

                    <div className="text-center text-[10px] text-gray-600 mt-4">
                        Sobek Play v2.0 - Made with Love & Magic
                    </div>
                </div>

            </div>
        </div>
    );
}
