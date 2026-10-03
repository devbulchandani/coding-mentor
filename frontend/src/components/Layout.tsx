import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAppStore from '../hooks/useAppStore';

const Layout = () => {
    const { user } = useAppStore();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
            <Navbar onMenuClick={() => setMenuOpen(true)} />
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <main className="min-h-screen pt-16 lg:pl-[260px]">
                <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
