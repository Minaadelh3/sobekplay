
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-4 border border-white/10 backdrop-blur-md ${
            type === 'success' 
              ? 'bg-accent-green/90 text-white shadow-accent-green/20' 
              : 'bg-red-500/90 text-white shadow-red-500/20'
          }`}
        >
          <div className={`p-1 rounded-full ${type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
            {type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <span className="font-bold text-sm md:text-base pr-4">{message}</span>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white transition-colors border-l border-white/20 pl-4"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
