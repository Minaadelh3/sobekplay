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

    // 2. Cleanup
    // No need to listen to location.state as custom event handles the click-to-reset behavior.
    // Preserving location.state would cause infinite reset loops on re-renders.
};
