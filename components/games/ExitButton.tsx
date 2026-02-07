import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ExitButtonProps {
    onConfirm?: () => void;
    confirmMessage?: string;
    className?: string;
    showConfirm?: boolean;
}

const ExitButton: React.FC<ExitButtonProps> = ({
    onConfirm,
    confirmMessage = "Are you sure you want to exit? All progress will be lost.",
    className = "",
    showConfirm = true
}) => {
    const navigate = useNavigate();

    const handleExit = () => {
        if (showConfirm) {
            if (window.confirm(confirmMessage)) {
                if (onConfirm) onConfirm();
                else navigate('/app/games'); // Default fallback
            }
        } else {
            if (onConfirm) onConfirm();
            else navigate('/app/games');
        }
    };

    return (
        <button
            onClick={handleExit}
            className={`px-4 py-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white/50 hover:text-red-400 text-sm font-bold border border-white/5 hover:border-red-500/50 transition-all backdrop-blur-sm z-50 ${className}`}
        >
            ✕ Exit
        </button>
    );
};

export default ExitButton;
