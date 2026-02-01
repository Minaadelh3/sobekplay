import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, authReady, roleReady, isAdmin } = useAuth();

    // 1. Wait for Auth AND Role to be ready
    if (!authReady || !roleReady) return (
        <div className="flex items-center justify-center h-screen bg-[#141414] text-white">
            <div className="animate-pulse">Checking Access...</div>
        </div>
    );

    // 2. Check User
    if (!user) return <Navigate to="/login" replace />;

    // 3. Check Admin
    if (!isAdmin) return <Navigate to="/app/home" replace />; // Redirect to App Home, not Root (avoids loop)

    return <>{children}</>;
}
