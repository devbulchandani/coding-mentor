import { Home, Book, MessageCircle, LogOut, Code } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import useAppStore from '../hooks/useAppStore';

interface NavItemProps {
    icon: LucideIcon;
    label: string;
    to: string;
}

const NavItem = ({ icon: Icon, label, to }: NavItemProps) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-t-md border-b-2 transition-all",
            "text-slate-600 hover:text-slate-900",
            isActive
                ? "border-secondary text-slate-900 bg-slate-50"
                : "border-transparent hover:border-slate-300"
        )}
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </NavLink>
);

const Navbar = () => {
    const { user, logout } = useAppStore();
    console.log("User:", user);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-sky-100 p-1.5 rounded-lg text-sky-600 group-hover:scale-105 transition-transform">
                        <Code className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                        Buildspace AI <span className="text-secondary">&lt;/&gt;</span>
                    </span>
                </Link>

                {user && (
                    <nav className="flex items-center gap-2 h-full pt-1">
                        <NavItem icon={Home} label="Dashboard" to="/dashboard" />
                        <NavItem icon={Book} label="Create Plans" to="/plans" />
                        <NavItem icon={MessageCircle} label="Mentor Chat" to="/chat" />
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="flex flex-col text-right hidden sm:block">
                                <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                                {user.name[0].toUpperCase() || "U"}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-500 hover:text-coral-500 hover:bg-coral-50 rounded-md transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-sky-600">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;
