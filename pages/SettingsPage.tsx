import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAppConfig } from '../hooks/useAppConfig';
import SettingsLayout from '../components/settings/SettingsLayout';
import { Section, SettingsInput } from '../components/settings/SettingsComponents';
import Toast from '../components/Toast';
import { AvatarManager } from '../components/settings/AvatarManager';
import { SecuritySection } from '../components/settings/SecuritySection';
import { app } from '../lib/firebase';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';

const auth = getAuth(app);

export default function SettingsPage() {
    const { user } = useAuth();
    const {
        updateProfile,
        updatePreferences, // Need this for app config persistence if we keep Theme/Language
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
    // Simple dirty check for Name
    const [originalName, setOriginalName] = useState('');

    // Sync local state when user updates (e.g. initial load)
    useEffect(() => {
        if (user) {
            const currentName = user.name || user.profile?.displayName || '';
            setName(currentName);
            setOriginalName(currentName);
        }
    }, [user]);

    // --- Handlers ---
    const handleNameSave = async () => {
        if (!name.trim()) {
            showToast("display name cannot be empty", 'error');
            return;
        }
        if (name === originalName) return;

        const success = await updateProfile({ displayName: name });
        if (success) {
            showToast("Name Updated!", 'success');
            setOriginalName(name); // Reset dirty state
        } else {
            showToast("Failed to update name.", 'error');
        }
    };

    const handlePasswordReset = async () => {
        if (user?.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                showToast(`Reset email sent to ${user.email}`, 'success');
            } catch (e: any) {
                showToast(e.message || "Error sending reset email", 'error');
            }
        }
    };

    // --- Renderers ---

    const renderProfile = () => (
        <>
            <AvatarManager
                userProfile={user?.profile}
                onUpdate={updateProfile}
                showToast={showToast}
            />

            <Section title="Display Name">
                <div className="flex flex-col gap-4">
                    <SettingsInput
                        label="Your Name"
                        value={name}
                        onChange={setName}
                        placeholder="Public display name"
                        icon="👤"
                    />

                    {name !== originalName && (
                        <div className="animate-fade-in">
                            <button
                                onClick={handleNameSave}
                                className="bg-accent-gold text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                            >
                                Save New Name
                            </button>
                        </div>
                    )}
                </div>
            </Section>
        </>
    );

    const renderNotifications = () => (
        <Section title="Push Notifications" icon="🔔">
            {!pushSupported ? (
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-300 text-sm">
                    ⚠️ Push Notifications aren't supported on this browser.
                </div>
            ) : (
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="font-bold text-blue-200">Device Status</h4>
                            <p className="text-xs text-blue-300/60 mt-1">
                                {fcmToken ? 'Receiving alerts on this device' : 'Notifications disabled'}
                            </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border font-bold ${fcmToken ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-gray-500 text-gray-500'}`}>
                            {fcmToken ? 'ACTIVE' : 'OFF'}
                        </span>
                    </div>

                    {!fcmToken ? (
                        <button
                            onClick={registerToken}
                            disabled={pushLoading}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm w-full font-bold hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-900/20"
                        >
                            {pushLoading ? 'Activating...' : 'Enable Notifications'}
                        </button>
                    ) : (
                        <button
                            onClick={unregisterToken}
                            disabled={pushLoading}
                            className="bg-transparent border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm w-full hover:bg-red-900/20 transition disabled:opacity-50"
                        >
                            Disable on this Device
                        </button>
                    )}

                    {permission === 'denied' && (
                        <p className="text-xs text-red-400 mt-3 bg-red-500/10 p-2 rounded">
                            ⚠️ Permission blocked. You must enable notifications in your browser settings manually.
                        </p>
                    )}
                </div>
            )}
        </Section>
    );

    const renderAccount = () => (
        <SecuritySection
            email={user?.email || ''}
            onResetPassword={handlePasswordReset}
        />
    );

    const renderApp = () => (
        <>
            <Section title="Appearance" icon="🎨">
                <div className="grid grid-cols-3 gap-2">
                    {['dark', 'light', 'system'].map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                updateConfig({ theme: t as any });
                                updatePreferences({ theme: t as any });
                            }}
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
                        onClick={() => {
                            updateConfig({ language: 'ar' });
                            updatePreferences({ language: 'ar' });
                        }}
                        className={`flex-1 p-3 rounded-lg border text-center font-bold transition-all ${config.language === 'ar'
                            ? 'bg-accent-gold text-black border-accent-gold transform scale-105'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                    >
                        العربية
                    </button>
                    <button
                        onClick={() => {
                            updateConfig({ language: 'en' });
                            updatePreferences({ language: 'en' });
                        }}
                        className={`flex-1 p-3 rounded-lg border text-center font-bold transition-all ${config.language === 'en'
                            ? 'bg-accent-gold text-black border-accent-gold transform scale-105'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                    >
                        English
                    </button>
                </div>
            </Section>
        </>
    );

    return (
        <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <Toast
                message={toast.msg}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />

            {/* In a simplified layout, we might just want a vertical stack if there are few items. 
                But keeping tabs allows for future expansion without clutter. 
                Let's ensure the tabs provided to SettingsLayout match what we have here.
                Assuming SettingsLayout determines tabs based on props or internal logic.
                If SettingsLayout hardcodes tabs, we might need to adjust it. 
                For now we assume standard tabs: Profile, Account, App. 
            */}

            {activeTab === 'profile' && (
                <>
                    {renderProfile()}
                    {renderNotifications()}
                </>
            )}

            {activeTab === 'account' && renderAccount()}

            {activeTab === 'app' && renderApp()}

            {/* If Privacy is removed, we don't render it */}
        </SettingsLayout>
    );
}
