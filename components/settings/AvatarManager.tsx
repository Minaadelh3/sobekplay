import React, { useState, useRef } from 'react';
import { uploadToCloudinary, getOptimizedAvatarUrl } from '../../lib/cloudinary';
import { UserProfile } from '../../types/auth'; // Removed TEAMS
import { MASRY_AVATARS } from '../../lib/avatars';

interface AvatarManagerProps {
    userProfile?: UserProfile;
    onUpdate: (data: { photoURL: string; avatarPublicId?: string }) => Promise<boolean>;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

export const AvatarManager: React.FC<AvatarManagerProps> = ({ userProfile, onUpdate, showToast }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const activeAvatarUrl = preview || getOptimizedAvatarUrl(userProfile?.photoURL);
    const hasPendingChanges = !!preview && !!fileToUpload;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast('صيغة الملف غير مدعومة. يرجى استخدام JPG أو PNG', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showToast('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
            return;
        }

        setFileToUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!fileToUpload) return;
        setUploading(true);
        try {
            const { secure_url, public_id } = await uploadToCloudinary(fileToUpload);
            // We only pass what changed.
            const success = await onUpdate({ photoURL: secure_url, avatarPublicId: public_id });

            if (success) {
                showToast('تم تحديث الصورة الشخصية بنجاح ✨', 'success');
                setPreview(null);
                setFileToUpload(null);
            } else {
                showToast('حدث خطأ أثناء حفظ الصورة', 'error');
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            showToast(error.message || 'فشل في رفع الصورة', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        if (confirm('هل أنت متأكد من حذف الصورة الشخصية والعودة للأفاتار الافتراضي؟')) {
            setUploading(true);
            const success = await onUpdate({ photoURL: '' });
            if (success) {
                showToast('تم حذف الصورة الشخصية', 'success');
                setPreview(null);
            }
            setUploading(false);
        }
    };

    const handleSelectDefault = async (url: string) => {
        setUploading(true);
        const success = await onUpdate({ photoURL: url });
        if (success) showToast('تم اختيار الأفاتار بنجاح! 🎭', 'success');
        setUploading(false);
    };

    const handleCancel = () => {
        setPreview(null);
        setFileToUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 transition-all hover:bg-white/10">
            {/* Glow Effect Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <span className="text-2xl">📸</span> الصورة الشخصية
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Avatar Display */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-accent-gold to-transparent rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500" />
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#121212] shadow-2xl">
                        <img
                            src={activeAvatarUrl || '/default-user.png'}
                            alt="Profile"
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${uploading ? 'opacity-50 blur-sm' : ''}`}
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <div className="w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    {hasPendingChanges && (
                        <div className="absolute bottom-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-[#121212] animate-bounce">
                            جديد
                        </div>
                    )}
                </div>

                {/* Actions Area */}
                <div className="flex-1 w-full flex flex-col gap-4">
                    {hasPendingChanges ? (
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 animate-fade-in text-center md:text-right">
                            <p className="text-accent-gold font-bold mb-3 text-sm">هل ترغب في اعتماد الصورة الجديدة؟</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={uploading}
                                    className="flex-1 bg-accent-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-yellow-900/20"
                                >
                                    حفظ التغييرات ✅
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={uploading}
                                    className="px-5 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition"
                                >
                                    إلغاء ↩️
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 rounded-xl hover:from-red-500 hover:to-red-400 transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 group"
                                >
                                    <span className="text-xl group-hover:scale-110 transition">🤳</span>
                                    <span>التقاط صورة</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2 group"
                                >
                                    <span className="text-xl group-hover:rotate-12 transition">🖼️</span>
                                    <span>مكتبة الصور</span>
                                </button>
                            </div>

                            {userProfile?.photoURL && (
                                <button
                                    onClick={handleRemovePhoto}
                                    className="text-xs text-red-500/60 hover:text-red-400 font-medium py-2 transition self-center md:self-start flex items-center gap-1"
                                >
                                    🗑️ حذف الصورة الحالية
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
            />
            <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="user"
                onChange={handleFileSelect}
            />

            {/* Default Avatars / Team Characters */}
            {!preview && (
                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>🎭</span> أفاتار مصري 3D
                    </p>
                    <div className="flex justify-start gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                        {MASRY_AVATARS.map(avatar => (
                            <button
                                key={avatar.id}
                                onClick={() => handleSelectDefault(avatar.src)}
                                className="relative group w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden transition-all transform hover:scale-110 focus:outline-none border-2 border-transparent hover:border-accent-gold"
                            >
                                <div className="absolute inset-0 bg-black/50" />
                                <img
                                    src={avatar.src}
                                    alt={avatar.name}
                                    className="w-full h-full object-cover group-hover:opacity-100 opacity-80 transition"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-center text-white py-0.5 truncate px-1">
                                    {avatar.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
