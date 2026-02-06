export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a file to Cloudinary using unsigned upload.
 * @param file The file to upload.
 * @returns The secure URL of the uploaded image.
 * @throws Error if upload fails.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
    // 1. Validate File Type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
    }

    // 2. Validate File Size (Max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 2MB.');
    }

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'profiles');

    // 4. Send Request
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw new Error(error.message || 'Failed to upload image to Cloudinary.');
    }
}

/**
 * Optimizes a Cloudinary URL with transformations for avatars.
 * Transformation: f_auto,q_auto,c_fill,w_256,h_256,g_face,r_max
 * @param url The original avatar URL.
 * @returns The optimized URL.
 */
export function getOptimizedAvatarUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (!url.includes('cloudinary.com')) return url;

    // Insert transformations before /v[version_number]/ or /upload/
    // Typical URL: https://res.cloudinary.com/[cloud_name]/image/upload/v12345678/profiles/image.jpg

    // If it already has transformations, we might want to be careful, but we will assume we are adding new ones or replacing standard format.
    // Using a regex to inject valid parameters.

    const transformations = 'f_auto,q_auto,c_fill,w_256,h_256,g_face,r_max';

    // Pattern to match /upload/ and optionally version
    // We want to insert after /upload/

    const parts = url.split('/upload/');
    if (parts.length === 2) {
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }

    return url;
}
