import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GamesErrorBoundary } from '../error/GamesErrorBoundary';
import { useRouteLogger } from '../../hooks/useRouteLogger';

const DebugRibbon = ({ authReady, user }: { authReady: boolean, user: any }) => {
    // Only show if user is admin (simplified check - enhance as needed)
    // Assuming user object has roles or we check a specific list
    const isAdmin = user?.email?.includes('admin') || user?.role === 'admin' || user?.isAdmin;

    if (!isAdmin) return null;

    return (
        <div className="fixed top-0 left-0 z-50 bg-black/80 text-[10px] text-green-400 px-2 py-1 font-mono border-b border-green-900 w-full pointer-events-none flex justify-between">
            <span>🛡️ GameRoute Active</span>
            <div className="flex gap-3">
                <span className={authReady ? "text-green-500" : "text-yellow-500"}>Auth: {authReady ? "Ready" : "Loading"}</span>
                <span className={user ? "text-green-500" : "text-red-500"}>User: {user ? "✅" : "❌"}</span>
                <span className="text-gray-500 line-through">ProfileGuard</span>
            </div>
        </div>
    );
};

export const GameRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, authReady } = useAuth();
    const location = useLocation();

    // Logging Integration
    useRouteLogger("GameRoute");

    // 1. Wait for Auth to be completely ready
    if (!authReady) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-gold">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold mb-4"></div>
                <p className="animate-pulse">Loading Game Environment...</p>
            </div>
        );
    }

    // 2. Auth Required
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 3. NO Profile/Team Checks -> Render Children within Error Boundary
    return (
        <>
            <DebugRibbon authReady={authReady} user={user} />
            <GamesErrorBoundary userId={user.id} gameId={location.pathname.split('/').pop()}>
                {children}
            </GamesErrorBoundary>
        </>
    );
};
