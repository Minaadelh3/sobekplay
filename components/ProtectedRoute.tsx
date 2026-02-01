import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, selectedTeam } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-gold">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold mb-4"></div>
                <p className="animate-pulse">Loading...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login while saving the attempted URL
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Force Team Selection
    // If not selected, and we are NOT already on the selection page => Redirect
    if (!selectedTeam && location.pathname !== '/profiles') {
        return <Navigate to="/profiles" replace />;
    }

    // Allow access
    return <>{children}</>;
};
