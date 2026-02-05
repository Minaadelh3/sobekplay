import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAppConfig } from '../hooks/useAppConfig';
import SettingsLayout from '../components/settings/SettingsLayout';
import { Section, Toggle, SettingsInput, DangerButton } from '../components/settings/SettingsComponents';
import Toast from '../components/Toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../lib/firebase';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';

const storage = getStorage(app);
const auth = getAuth(app);

export default function SettingsPage() {
    const { user, firebaseUser } = useAuth();
    const {
        updateProfile,
        updatePrivacy,
        exportUserData,
        deleteAccountStart,
        updateNotifications
    } = useSettings();

    // Global App Config
    const { config, updateConfig } = useAppConfig();

    // Notifications Hook
    const {
        permission,
        fcmToken,
        registerToken,
        unregisterToken,
        loading: pushLoading,
        isSupported: pushSupported
    } = usePushNotifications();

    const [activeTab, setActiveTab] = useState('profile');

    // UI State
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error', visible: boolean }>({ msg: '', type: 'success', visible: false });
    const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type, visible: true });

    // Local State
    const [name, setName] = useState(user?.name || user?.profile?.displayName || '');
    const [bio, setBio] = useState(user?.profile?.bio || '');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync local state when user updates (e.g. initial load)
    useEffect(() => {
        if (user) {
            setName(user.name || user.profile?.displayName || '');
            setBio(user.profile?.bio || '');
            setMobile(user.mobile || '');
        }
    }, [user]);

    // --- Handlers ---

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !firebaseUser) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${firebaseUser.uid}/profile_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateProfile({ photoURL: downloadURL });
            showToast('Avatar updated successfully!', 'success');
        } catch (error) {
            console.error("Upload failed", error);
            showToast("Failed to upload image.", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleProfileSave = async () => {
        const success = await updateProfile({ displayName: name, bio: bio, mobile: mobile });
        if (success) showToast("Profile Updated!", 'success');
        else showToast("Failed to update profile.", 'error');
    };

    const handlePasswordReset = async () => {
        if (user?.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                showToast(`Password reset email sent to ${user.email}`, 'success');
            } catch (e) {
                showToast("Error sending reset email", 'error');
            }
        }
    };

    // --- Renderers ---

    const renderProfile = () => (
        <Section title="Identity" description="How you appear to others">
            <div className="flex items-center gap-6 mb-8 bg-black/20 p-4 rounded-xl">
                <div
                    className="relative group cursor-pointer w-24 h-24 flex-shrink-0"
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
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                    <p className="text-gray-500 text-sm">
                        Member since {user?.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Recently'}
                    </p>
                </div>
            </div>

            <SettingsInput label="Display Name" value={name} onChange={setName} placeholder="Your public name" icon="👤" />
            <SettingsInput label="Bio" value={bio} onChange={setBio} placeholder="Short bio..." icon="📝" />
            <SettingsInput label="Mobile Number" value={mobile} onChange={setMobile} placeholder="+20 123 456 7890" icon="📱" />

            <div className="pt-2">
                <button
                    onClick={handleProfileSave}
                    className="bg-accent-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                >
                    Save Changes
                </button>
            </div>
        </Section>
    );

    const renderAccount = () => (
        <>
            <Section title="Security" icon="🔐">
                <SettingsInput
                    label="Email Address"
                    value={user?.email || ''}
                    onChange={() => { }}
                    disabled={true}
                    icon="📧"
                />
                <button
                    onClick={handlePasswordReset}
                    className="text-accent-gold underline text-sm mt-2 block"
                >
                    Send Password Reset Email
                </button>
            </Section>

            <Section title="Data & Privacy" icon="💾">
                <button
                    onClick={exportUserData}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition"
                >
                    <span className="font-bold">📤 Export My Data (JSON)</span>
                    <span className="text-gray-500 text-xs">Download a copy of your data</span>
                </button>
            </Section>

            <Section title="Danger Zone" icon="☢️">
                <DangerButton
                    label="Delete Account"
                    confirmationText="This will permanently delete your account & data."
                    onClick={deleteAccountStart}
                />
            </Section>
        </>
    );

    const renderApp = () => (
        <>
            <Section title="Appearance" icon="🎨">
                <div className="grid grid-cols-3 gap-2">
                    {['dark', 'light', 'system'].map((t) => (
                        <button
                            key={t}
                            onClick={() => updateConfig({ theme: t as any })}
                            className={`p-3 rounded-lg border text-center capitalize transition-all ${config.theme === t
                                ? 'bg-accent-gold text-black border-accent-gold font-bold transform scale-105'
                                : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </Section>

            <Section title="Language" icon="🌐">
                <div className="flex gap-2">
                    <button
                        onClick={() => updateConfig({ language: 'ar' })}
                        className={`flex-1 p-3 rounded-lg border text-center font-bold transition-all ${config.language === 'ar'
                            ? 'bg-accent-gold text-black border-accent-gold transform scale-105'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                    >
                        العربية
                    </button>
                    <button
                        onClick={() => updateConfig({ language: 'en' })}
                        className={`flex-1 p-3 rounded-lg border text-center font-bold transition-all ${config.language === 'en'
                            ? 'bg-accent-gold text-black border-accent-gold transform scale-105'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                    >
                        English
                    </button>
                </div>
            </Section>

            <Section title="Push Notifications" icon="🔔">
                {!pushSupported ? (
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-300 text-sm">
                        ⚠️ Push Notifications aren't supported on this device/browser.
                    </div>
                ) : (
                    <>
                        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-blue-200">Device Status</span>
                                <span className={`text-xs px-2 py-1 rounded border ${fcmToken ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-500'}`}>
                                    {fcmToken ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {!fcmToken ? (
                                <button
                                    onClick={registerToken}
                                    disabled={pushLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full font-bold hover:bg-blue-500 transition disabled:opacity-50"
                                >
                                    {pushLoading ? 'Registering...' : 'Enable Notifications on this Device'}
                                </button>
                            ) : (
                                <button
                                    onClick={unregisterToken}
                                    disabled={pushLoading}
                                    className="bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm w-full hover:bg-red-900/80 transition disabled:opacity-50"
                                >
                                    Disable on this Device
                                </button>
                            )}

                            {permission === 'denied' && (
                                <p className="text-xs text-red-400 mt-2">
                                    ⚠️ Permission denied. Please enable notifications in browser settings.
                                </p>
                            )}
                        </div>

                        {/* Notification Categories */}
                        <div className="space-y-4 mb-6 pt-6 border-t border-white/5">
                            <h4 className="font-bold text-white mb-2">Categories</h4>
                            <Toggle
                                label="Game Updates"
                                description="Match alerts, score updates, and team news"
                                checked={user?.notifications?.games ?? true}
                                onChange={(v) => updateNotifications({ games: v })}
                                icon="🎮"
                            />
                            <Toggle
                                label="Marketing & Promos"
                                description="Offers, new features, and events"
                                checked={user?.notifications?.marketing ?? true}
                                onChange={(v) => updateNotifications({ marketing: v })}
                                icon="🎁"
                            />
                            <Toggle
                                label="System Alerts"
                                description="Security alerts and maintenance"
                                checked={user?.notifications?.system ?? true}
                                onChange={(v) => updateNotifications({ system: v })}
                                icon="🔧"
                            />
                        </div>

                        {/* Quiet Hours UI */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🌙</span>
                                    <div>
                                        <h4 className="font-bold text-white">Quiet Hours</h4>
                                        <p className="text-xs text-gray-400">Suspend notifications during these times</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1 uppercase">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                        value={user?.notifications?.quietHours?.start || "22:00"}
                                        onChange={(e) => {
                                            const newStart = e.target.value;
                                            const currentEnd = user?.notifications?.quietHours?.end || "08:00";
                                            updateNotifications({
                                                quietHours: {
                                                    start: newStart,
                                                    end: currentEnd,
                                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                                }
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1 uppercase">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                        value={user?.notifications?.quietHours?.end || "08:00"}
                                        onChange={(e) => {
                                            const newEnd = e.target.value;
                                            const currentStart = user?.notifications?.quietHours?.start || "22:00";
                                            updateNotifications({
                                                quietHours: {
                                                    start: currentStart,
                                                    end: newEnd,
                                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2">
                                * Times use your local device timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
                            </p>
                        </div>
                    </>
                )}
            </Section>
        </>
    );

    const renderPrivacy = () => (
        <Section title="Privacy Controls" icon="🛡️">
            <Toggle
                label="Public Profile"
                description="Allow others to see your stats"
                checked={user?.privacy?.isPublic ?? true}
                onChange={(v) => updatePrivacy({ isPublic: v })}
                icon="👀"
            />
            <Toggle
                label="Share Usage Data"
                description="Help us improve Sobek Play"
                checked={false} // Force off for now/example
                onChange={() => { }} // No-op
                icon="📊"
                disabled={true}
            />
        </Section>
    );

    return (
        <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <Toast
                message={toast.msg}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />

            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'account' && renderAccount()}
            {activeTab === 'app' && renderApp()}
            {activeTab === 'privacy' && renderPrivacy()}
        </SettingsLayout>
    );
}
