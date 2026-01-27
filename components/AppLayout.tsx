import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

import MobileBottomNav from './MobileBottomNav';

const AppLayout: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-nearblack pb-20 md:pb-0">
                <Outlet />
            </main>
            <MobileBottomNav />
        </>
    );
};

export default AppLayout;
