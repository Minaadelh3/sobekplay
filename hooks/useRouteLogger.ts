import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface RouteLog {
    route: string;
    params: any;
    status: 'enter' | 'exit' | 'blocked' | 'error';
    reason?: string;
}

export function useRouteLogger(componentName: string) {
    const location = useLocation();
    const params = useParams();
    const { user } = useAuth();
    const startTime = useRef<number>(Date.now());
    const loggedEnter = useRef<string | null>(null);

    const logToFirestore = async (data: RouteLog) => {
        try {
            await addDoc(collection(db, 'route_logs'), {
                userId: user?.id || 'anonymous',
                ...data,
                timestamp: serverTimestamp(),
                component: componentName,
                userAgent: navigator.userAgent
            });
        } catch (e) {
            console.warn("Route Logging Failed", e);
        }
    };

    useEffect(() => {
        const currentPath = location.pathname;

        // Log Entry
        if (loggedEnter.current !== currentPath) {
            logToFirestore({
                route: currentPath,
                params,
                status: 'enter'
            });
            loggedEnter.current = currentPath;
            startTime.current = Date.now();
        }

        return () => {
            // Log Exit (clean up)
            const duration = Date.now() - startTime.current;
            // Optional: Only log exit if significant time or specific need
            // avoiding too much spam, but per requirements we need tracking
        };
    }, [location.pathname, user?.id]); // Depend on user to update log if auth changes

    const logError = (reason: string) => {
        logToFirestore({
            route: location.pathname,
            params,
            status: 'error',
            reason
        });
    };

    const logBlock = (reason: string) => {
        logToFirestore({
            route: location.pathname,
            params,
            status: 'blocked',
            reason
        });
    };

    return { logError, logBlock };
}
