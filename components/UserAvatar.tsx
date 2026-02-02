import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    className?: string;
    border?: boolean;
    borderColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name = '',
    size = 'md',
    className = '',
    border = false,
    borderColor = 'border-white/10'
}) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setImgError(false);
    }, [src]);

    // Size mappings
    const sizeClasses = {
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-2xl',
        custom: ''
    };

    const rootClasses = `
        ${sizeClasses[size]} 
        ${className} 
        rounded-full 
        object-cover 
        flex-shrink-0
        ${border ? `border-2 ${borderColor}` : ''}
    `.trim();

    // Fallback Initials
    const getInitials = (n: string | null | undefined) => {
        if (!n) return '?';
        const parts = n.split(' ').filter(p => p.length > 0);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Color generation based on name hash for consistency
    const getBgColor = (n: string | null | undefined) => {
        if (!n) return 'bg-gray-700';
        let hash = 0;
        for (let i = 0; i < n.length; i++) {
            hash = n.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-green-500',
            'bg-yellow-600', 'bg-purple-500', 'bg-indigo-500',
            'bg-pink-500', 'bg-teal-500'
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    const safeName = name || '';

    if (!src || imgError) {
        return (
            <div
                className={`${rootClasses} ${getBgColor(safeName)} flex items-center justify-center text-white font-bold select-none`}
                title={safeName}
            >
                {getInitials(safeName)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={safeName}
            className={rootClasses}
            referrerPolicy="no-referrer"
            onError={(e) => {
                // Prevent infinite loop if fallback fails (shouldn't happen since we switch to div)
                setImgError(true);
            }}
        />
    );
};

export default UserAvatar;
