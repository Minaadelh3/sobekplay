import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#141414] text-white">
            <div className="animate-pulse">Loading Admin...</div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return <>{children}</>;
}
