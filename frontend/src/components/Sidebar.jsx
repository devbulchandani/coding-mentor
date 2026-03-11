import { BookOpen, MessageSquare, ListChecks, Plug, Code2, RefreshCw } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import useAppStore from '../hooks/useAppStore';
import { useState } from 'react';
import PlanSelectorModal from './PlanSelectorModal';

const SidebarItem = ({ icon: Icon, label, to, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "text-slate-600 hover:bg-slate-100 hover:text-sky-600",
                isActive && "bg-sky-50 text-sky-700 bg-opacity-60"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </NavLink>
    );
};

const Sidebar = () => {
    const { currentPlan } = useAppStore();
    const [showPlanSelector, setShowPlanSelector] = useState(false);

    return (
        <>
            <aside className="w-64 h-[calc(100vh-64px)] fixed top-16 left-0 bg-background border-r border-slate-200 shadow-sm flex flex-col z-20">
                {/* Grid Pattern Background Effect */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30 pointer-events-none" />

                <div className="p-4 relative z-10">
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            Current Plan
                        </h3>
                        <div className="bg-white border boundary-slate-200 rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Code2 className="w-4 h-4 text-sky-500" />
                                <span className="font-semibold text-sm text-slate-800">
                                    {currentPlan?.title || "No Active Plan"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mb-3">
                                {currentPlan?.subtitle || "Spring Boot Todo API"}
                            </p>
                            {currentPlan && (
                                <button
                                    onClick={() => setShowPlanSelector(true)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium rounded-md transition-colors border border-sky-200"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Change Plan
                                </button>
                            )}
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem icon={ListChecks} label="Current Milestone" to="/dashboard" />
                        <SidebarItem icon={MessageSquare} label="Chat with Mentor" to="/chat" />
                        <SidebarItem icon={BookOpen} label="Check Progress" to="/dashboard?tab=progress" />
                        <SidebarItem icon={Plug} label="MCP Integration" to="/mcp" />
                    </nav>
                </div>
            </aside>

            {showPlanSelector && (
                <PlanSelectorModal isOpen={showPlanSelector} onClose={() => setShowPlanSelector(false)} />
            )}
        </>
    );
};

export default Sidebar;
