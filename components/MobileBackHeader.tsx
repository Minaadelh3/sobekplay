import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileBackHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show only on deep routes (not home tabs)
        const mainTabs = ['/app/home', '/app/movies', '/app/series', '/app/search', '/app/my-list'];
        const isMainTab = mainTabs.includes(location.pathname);
        setShow(!isMainTab && window.innerWidth < 768); // Mobile only check
    }, [location]);

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/app/home', { replace: true });
        }
    };

    if (!show) return null;

    return (
        <div className="md:hidden sticky top-0 z-50 bg-[#070A0F]/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-white/5">
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/80 hover:text-accent-gold transition-colors active:scale-95"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="text-sm font-medium">Back</span>
            </button>
        </div>
    );
}
