import { BookOpen, MessageSquare, ListChecks, Plug, Code2, RefreshCw, X, Plus, Laptop } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { createElement, useState } from 'react';
import { cn } from '../lib/utils';
import useAppStore from '../hooks/useAppStore';
import PlanSelectorModal from './PlanSelectorModal';
import LiveMentor from './LiveMentor';
import BrandLogo from './BrandLogo';

interface SidebarProps { open: boolean; onClose: () => void; }
interface SidebarItemProps { icon: LucideIcon; label: string; to: string; onClick?: () => void; }

const SidebarItem = ({ icon, label, to, onClick }: SidebarItemProps) => <NavLink to={to} onClick={onClick} className={({ isActive }) => cn(
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
)}>{({ isActive }) => <>{createElement(icon, { className: cn('h-[17px] w-[17px]', isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'), strokeWidth: 1.9 })}<span>{label}</span></>}</NavLink>;

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const { currentPlan } = useAppStore();
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const navigate = useNavigate();

    const contents = <>
        <div className="px-4 pb-5 pt-6">
            <p className="eyebrow mb-3 px-2">Workspace</p>
            <nav className="space-y-1" aria-label="Main navigation">
                <SidebarItem icon={ListChecks} label="Overview" to="/dashboard" onClick={onClose} />
                <SidebarItem icon={MessageSquare} label="AI mentor" to="/chat" onClick={onClose} />
                <SidebarItem icon={Laptop} label="Project IDE" to="/workspace" onClick={onClose} />
                <SidebarItem icon={Plug} label="Integrations" to="/mcp" onClick={onClose} />
            </nav>
        </div>
        <div className="px-4">
            <div className="mb-3 flex items-center justify-between px-2"><p className="eyebrow">Your learning</p>{currentPlan && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Plan active" />}</div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm shadow-slate-900/[0.02]">
                <div className="mb-3 flex items-start gap-2.5"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Code2 className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-[13px] font-bold text-slate-800">{currentPlan?.title || 'No active plan'}</p><p className="mt-1 truncate text-xs text-slate-400">{currentPlan?.tech || 'Start a learning path'}</p></div></div>
                <button onClick={() => currentPlan ? setShowPlanSelector(true) : navigate('/create-plan')} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">{currentPlan ? <><RefreshCw className="h-3.5 w-3.5" /> Switch plan</> : <><Plus className="h-3.5 w-3.5" /> Create a plan</>}</button>
            </div>
            <div className="mt-2"><SidebarItem icon={BookOpen} label="Create another plan" to="/create-plan" onClick={onClose} /></div>
        </div>
        <div className="hidden px-4 pt-5 lg:block"><LiveMentor /></div>
        <div className="mt-auto border-t border-slate-200/70 px-6 py-4"><p className="text-[11px] font-medium text-slate-400">A little progress, every day.</p></div>
    </>;

    return <>
        <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[260px] flex-col overflow-y-auto border-r border-slate-200/80 bg-[#fbfcff] lg:flex">{contents}</aside>
        {open && <div className="fixed inset-0 z-50 lg:hidden" role="presentation"><button aria-label="Close navigation" onClick={onClose} className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]" /><aside className="absolute bottom-0 left-0 top-0 flex w-[min(310px,88vw)] flex-col overflow-y-auto border-r border-slate-200 bg-[#fbfcff] shadow-2xl"><div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5"><BrandLogo iconClassName="h-7 w-7" /><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation"><X className="h-5 w-5" /></button></div>{contents}</aside></div>}
        <PlanSelectorModal isOpen={showPlanSelector} onClose={() => setShowPlanSelector(false)} />
    </>;
};

export default Sidebar;
