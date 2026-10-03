import { useState } from 'react';
import { ArrowUpRight, Code2, Github, MessageSquare, Settings2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import MilestoneTimeline from '../components/MilestoneTimeline';
import RepoSettingsModal from '../components/RepoSettingsModal';
import useAppStore from '../hooks/useAppStore';

const Dashboard = () => {
    const { user, currentPlan, repoUrl, milestones } = useAppStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const navigate = useNavigate();
    const nextMilestone = milestones?.find((milestone) => !milestone.completed);

    return <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Your workspace</p><h1 className="page-heading mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Developer'}</h1><p className="mt-2 text-sm text-slate-500">Pick up where you left off and keep building.</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => setIsSettingsOpen(true)} className="button-secondary"><Github className="h-4 w-4" /> {repoUrl ? 'Repository' : 'Connect repository'} <Settings2 className="h-3.5 w-3.5 text-slate-400" /></button>{currentPlan && <button onClick={() => navigate('/workspace')} className="button-primary"><Code2 className="h-4 w-4" /> Open project IDE</button>}{currentPlan && <button onClick={() => navigate('/chat')} className="button-secondary"><MessageSquare className="h-4 w-4" /> Ask your mentor</button>}</div>
        </div>
        <ProjectCard />
        {currentPlan && nextMilestone && <section className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-500">Continue learning</p><p className="mt-1 truncate text-sm font-bold text-slate-800">Step {nextMilestone.sequenceNumber}: {nextMilestone.title}</p></div><Link to={`/milestone/${nextMilestone.id}`} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900">Open milestone <ArrowUpRight className="h-4 w-4" /></Link></section>}
        <MilestoneTimeline />
        <RepoSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>;
};

export default Dashboard;
