import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface TabResetDetail {
    path: string;
}

export const useTabReset = (tabPath: string, onReset: () => void) => {
    const location = useLocation();

    useEffect(() => {
        const handleReset = (e: Event) => {
            const customEvent = e as CustomEvent<TabResetDetail>;
            if (customEvent.detail.path === tabPath) {
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Invoke callback
                onReset();
            }
        };

        window.addEventListener('tab-reset', handleReset);

        return () => {
            window.removeEventListener('tab-reset', handleReset);
        };
    }, [tabPath, onReset]);

    // Optional: Also listen to location state if legacy implementation exists
    useEffect(() => {
        if (location.state && (location.state as any).resetTab && location.pathname.startsWith(tabPath)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onReset();
        }
    }, [location.state, location.pathname, tabPath, onReset]);
};
