import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAppStore from '../hooks/useAppStore';

const Layout = () => {
    const { user } = useAppStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Global background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white opacity-60" />

            <Navbar />

            <div className="pt-16 flex min-h-screen relative z-10">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 transition-all duration-300">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
