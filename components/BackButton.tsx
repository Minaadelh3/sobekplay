import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    fallbackPath?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
    fallbackPath = '/app/movies',
    className = ''
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        // Check if there is history to go back to, otherwise fallback
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleBack();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <button
            onClick={handleBack}
            aria-label="Go Back"
            className={`fixed top-6 left-6 z-50 w-12 h-12 flex items-center justify-center 
        bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white 
        hover:bg-white/20 hover:scale-110 active:scale-95 transition-all group
        ${className}`}
            style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}
        >
            <svg
                className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
};

export default BackButton;
