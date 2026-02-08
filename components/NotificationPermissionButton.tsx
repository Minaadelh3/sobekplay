import React from 'react';
import { useOneSignal } from '../hooks/useOneSignal';
import { Bell } from 'lucide-react';

export const NotificationPermissionButton: React.FC = () => {
    const { permission, enableNotifications, isSupported } = useOneSignal();

    if (!isSupported || permission === 'granted' || permission === 'denied') {
        return null;
    }

    return (
        <button
            onClick={enableNotifications}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
            <Bell className="w-4 h-4" />
            <span>Enable Notifications</span>
        </button>
    );
};
