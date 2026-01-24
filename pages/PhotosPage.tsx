
import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';
import { posters } from '../data/posters';
import ImageWithFallback from '../components/ImageWithFallback';
import Toast from '../components/Toast';

const PhotosPage: React.FC = () => {
  // Use all posters for the gallery, randomized once on mount
  const galleryImages = useMemo(() => {
    return [...posters].sort(() => Math.random() - 0.5);
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setIsUploading(true);
        
        // Simulate upload network request
        setTimeout(() => {
            setIsUploading(false);
            
            // Randomly succeed or fail for demonstration
            // In a real app, this would depend on the API response
            const isSuccess = Math.random() > 0.2; // 80% success rate

            if (isSuccess) {
                setToast({
                    visible: true,
                    message: 'Photo uploaded successfully! It will appear after moderation.',
                    type: 'success'
                });
            } else {
                setToast({
                    visible: true,
                    message: 'Upload failed. Please check your connection and try again.',
                    type: 'error'
                });
            }

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, 2500);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <Toast 
        isVisible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileSelect}
      />

      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">Trip Gallery</h1>
                <p className="text-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Capturing the moments, the magic, and the memories of our journey along the Nile. 
                    From the temples of Aswan to the shores of the Nuba.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {siteConfig.UPLOAD_FOLDER_URL && (
                        <a
                            href={siteConfig.UPLOAD_FOLDER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto inline-flex items-center justify-center space-x-3 bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all border border-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            <span>Open Google Album</span>
                        </a>
                    )}
                    
                    <button
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className="w-full md:w-auto inline-flex items-center justify-center space-x-3 bg-accent-green text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl shadow-accent-green/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isUploading ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Uploading...</span>
                             </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Direct Upload</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </header>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryImages.map((img, idx) => (
                <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-lg"
                >
                    <ImageWithFallback
                        src={img.src}
                        alt={img.title || "Gallery Memory"}
                        className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-sm tracking-widest uppercase">{img.title}</span>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="mt-24 text-center border-t border-white/5 pt-12">
            <h3 className="text-2xl font-bold mb-4">Have photos to share?</h3>
            <p className="text-muted mb-8">Join the community album and let your perspective be part of the story.</p>
            <button
                onClick={triggerFileInput}
                className="text-accent-green font-bold hover:text-white transition-colors border-b border-accent-green pb-1"
            >
                Upload to Community Gallery
            </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;
