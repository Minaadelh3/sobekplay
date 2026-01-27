import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-nearblack">
                <Outlet />
            </main>
        </>
    );
};

export default AppLayout;
