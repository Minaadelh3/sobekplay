import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface KioskContextType {
    isKiosk: boolean;
    enterKiosk: () => void;
    exitKiosk: () => void;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isKiosk, setIsKiosk] = useState(false);

    // Enter Fullscreen
    const enterKiosk = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsKiosk(true);
            }
        } catch (err) {
            console.error("Error attempting to enable kiosk mode:", err);
        }
    }, []);

    // Exit Fullscreen
    const exitKiosk = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setIsKiosk(false);
            }
        } catch (err) {
            console.error("Error attempting to exit kiosk mode:", err);
        }
    }, []);

    // Sync state with actual fullscreen changes (e.g. user pressed Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsKiosk(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Secret Exit Triggers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + Shift + K to toggle/exit
            if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
                if (isKiosk) exitKiosk();
                else enterKiosk();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isKiosk, enterKiosk, exitKiosk]);

    // Prevent back navigation out of app (Basic Lock)
    useEffect(() => {
        if (!isKiosk) return;

        // Push current state to lock history
        window.history.pushState(null, "", window.location.pathname);

        const handlePopState = () => {
            if (isKiosk) {
                // Prevent going back
                window.history.pushState(null, "", window.location.pathname);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isKiosk]);

    return (
        <KioskContext.Provider value={{ isKiosk, enterKiosk, exitKiosk }}>
            {children}

            {/* Visual Indicator of Kiosk Mode */}
            {isKiosk && (
                <div className="fixed bottom-2 right-2 z-[9999] pointer-events-none opacity-20">
                    <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                </div>
            )}
        </KioskContext.Provider>
    );
};

export const useKiosk = () => {
    const context = useContext(KioskContext);
    if (!context) {
        throw new Error('useKiosk must be used within a KioskProvider');
    }
    return context;
};
