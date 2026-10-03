import { LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../hooks/useAppStore';
import BrandLogo from './BrandLogo';
import { githubApi } from '../api/githubApi';

interface NavbarProps { onMenuClick: () => void; }

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const { user, logout } = useAppStore();
    const navigate = useNavigate();
    const handleLogout = async () => { try { await githubApi.disconnect(); } catch { /* Continue local sign-out if GitHub is temporarily unavailable. */ } logout(); navigate('/login'); };

    return <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
                <Link to="/dashboard" aria-label="Buildspace home"><BrandLogo iconClassName="h-8 w-8" /></Link>
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2.5 sm:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
                    <div className="hidden min-w-0 md:block"><p className="max-w-40 truncate text-sm font-semibold leading-4 text-slate-800">{user?.name || 'Developer'}</p><p className="mt-1 text-[11px] leading-3 text-slate-400">Your workspace</p></div>
                </div>
                <span className="hidden h-7 w-px bg-slate-200 sm:block" />
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" title="Sign out"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
            </div>
        </div>
    </header>;
};

export default Navbar;
