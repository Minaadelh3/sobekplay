import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, authReady, selectedTeam } = useAuth();
    const location = useLocation();

    // 1. Wait for Auth to be completely ready (no guessing)
    if (!authReady) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-gold">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold mb-4"></div>
                <p className="animate-pulse">Loading...</p>
            </div>
        );
    }

    // 2. Auth Ready? Check User
    if (!user) {
        // Redirect to login only after we are sure there is no user
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 3. Check Onboarding Status (NEW STEP)
    // If user is NOT onboarded, and is NOT currently on the onboarding page -> Block and Redirect.
    if (!user.isOnboarded && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // 4. Check Team (if onboarded but no team selected - logic shift)
    // If we are ONBOARDED, but no Team, and not on profiles/onboarding -> Profiles
    if (user.isOnboarded && !selectedTeam && location.pathname !== '/profiles' && location.pathname !== '/onboarding') {
        return <Navigate to="/profiles" replace />;
    }

    // 5. Access Granted
    return <>{children}</>;
};
