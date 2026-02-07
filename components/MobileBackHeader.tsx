import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileBackHeader({ title }: { title?: string }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/app/home', { replace: true });
        }
    };

    return (
        <div className="md:hidden sticky top-0 z-50 bg-[#070A0F]/90 backdrop-blur-md px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center border-b border-white/5">
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/80 hover:text-accent-gold transition-colors active:scale-95"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="text-sm font-medium">Back</span>
            </button>
            {title && <span className="ml-4 font-bold text-lg">{title}</span>}
        </div>
    );
}
