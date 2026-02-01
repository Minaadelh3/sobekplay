import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading, roleLoading, isAdmin } = useAuth();

    if (loading || roleLoading) return (
        <div className="flex items-center justify-center h-screen bg-[#141414] text-white">
            <div className="animate-pulse">Checking Access...</div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />; // Kick non-admins to home

    return <>{children}</>;
}
