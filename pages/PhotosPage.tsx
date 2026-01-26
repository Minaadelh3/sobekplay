import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const PhotosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
              <svg className="w-10 h-10 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">Community Gallery</h1>
          <p className="text-muted text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            The trip memories live here. We use Google Photos to share high-quality moments with everyone in the tribe.
          </p>
          
          {siteConfig.UPLOAD_FOLDER_URL ? (
            <div className="bg-charcoal border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto">
                <a
                    href={siteConfig.UPLOAD_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-3 bg-accent-green text-white px-8 py-5 rounded-xl font-bold text-lg hover:bg-opacity-90 hover:scale-105 transition-all shadow-xl shadow-accent-green/10 mb-10"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <span>Open Shared Album</span>
                </a>

                <div className="text-left border-t border-white/5 pt-8">
                    <h3 className="text-accent-gold font-bold uppercase tracking-widest text-sm mb-6 text-center">How to upload photos</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold shrink-0">1</div>
                            <p className="text-white/80 leading-relaxed">Click the button above to open the shared Google Photos album.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold shrink-0">2</div>
                            <p className="text-white/80 leading-relaxed">Sign in with your Google account if asked.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold shrink-0">3</div>
                            <p className="text-white/80 leading-relaxed">Tap the "Add Photos" icon (usually a picture icon with a +) at the top.</p>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold shrink-0">4</div>
                            <p className="text-white/80 leading-relaxed">Select your best shots to share them instantly with the group.</p>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="p-12 bg-charcoal rounded-3xl border border-white/5">
                <p className="text-white">Gallery link coming soon.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PhotosPage;