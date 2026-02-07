import React, { useState, useRef } from 'react';
import { Section } from './SettingsComponents';
import { uploadToCloudinary, getOptimizedAvatarUrl } from '../../lib/cloudinary';
import { UserProfile } from '../../types/auth';

interface AvatarManagerProps {
    userProfile?: UserProfile;
    onUpdate: (data: { photoURL: string; avatarPublicId: string }) => Promise<boolean>;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

export const AvatarManager: React.FC<AvatarManagerProps> = ({ userProfile, onUpdate, showToast }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const activeAvatarUrl = preview || getOptimizedAvatarUrl(userProfile?.photoURL);
    const hasPendingChanges = !!preview && !!fileToUpload;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            showToast('Invalid file type. Please use JPG or PNG.', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            showToast('Image is too large. Max 2MB.', 'error');
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
            const success = await onUpdate({ photoURL: secure_url, avatarPublicId: public_id });

            if (success) {
                showToast('Profile photo updated!', 'success');
                // Clear preview state so we fall back to the new userProfile.photoURL
                setPreview(null);
                setFileToUpload(null);
            } else {
                showToast('Failed to save profile.', 'error');
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            showToast(error.message || 'Upload failed.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setPreview(null);
        setFileToUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Section title="Profile Photo">
            <div className="flex items-center gap-6">
                <div
                    className={`relative w-24 h-24 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${hasPendingChanges ? 'border-accent-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'border-white/10 hover:border-white/30'
                        }`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <img
                        src={activeAvatarUrl || '/default-user.png'}
                        alt="Profile"
                        className={`w-full h-full object-cover ${uploading ? 'opacity-50 blur-sm' : ''}`}
                    />

                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Edit</span>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    {hasPendingChanges ? (
                        <div className="animate-fade-in">
                            <p className="text-sm text-gray-300 mb-3">Previewing new photo...</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={uploading}
                                    className="bg-accent-gold text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 transition disabled:opacity-50"
                                >
                                    {uploading ? 'Saving...' : 'Save Photo'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={uploading}
                                    className="text-gray-400 text-sm hover:text-white px-2 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Upload a square image (JPG/PNG). Max 2MB.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-accent-gold text-sm font-bold hover:underline"
                            >
                                Tap to Upload
                            </button>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                />
            </div>
        </Section>
    );
};
