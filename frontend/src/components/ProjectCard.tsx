import { useState } from 'react';
import { BookOpen, Clock3, Target, ExternalLink, Github, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../hooks/useAppStore';
import PlanSelectorModal from './PlanSelectorModal';

const ProjectCard = () => {
    const { currentPlan, repoUrl, milestones } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const completed = milestones?.filter((milestone) => milestone.completed).length || 0;
    const total = milestones?.length || 0;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    if (!currentPlan) return <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Your next chapter starts here</span>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Build something. Learn everything.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">Turn a technology you want to learn into a clear, hands-on project roadmap with an AI mentor by your side.</p>
            <Link to="/create-plan" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-indigo-50">Create your first plan <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
    </section>;

    return <>
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
            <div className="absolute -right-12 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 hidden h-full w-1/3 opacity-20 sm:block" style={{ backgroundImage: 'radial-gradient(#a5b4fc 1px, transparent 1px)', backgroundSize: '15px 15px', maskImage: 'linear-gradient(to left, black, transparent)' }} />
            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
                <div className="min-w-0">
                    <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-indigo-200"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" /> CURRENT LEARNING PATH</div>
                    <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl">{currentPlan.title || currentPlan.projectName}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{currentPlan.subtitle || currentPlan.projectDescription || `A hands-on ${currentPlan.tech || 'development'} learning journey, made for your pace.`}</p>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-indigo-300" /> {currentPlan.durationDays || 5} days</span>
                        <span className="inline-flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-indigo-300" /> {currentPlan.skillLevel || 'Beginner'}</span>
                        {repoUrl && <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-indigo-200 hover:text-white"><Github className="h-3.5 w-3.5" /><span className="max-w-[220px] truncate">{repoUrl.replace(/^https?:\/\//, '')}</span><ExternalLink className="h-3 w-3" /></a>}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-5 md:min-w-[210px] md:flex-col md:items-end">
                    <div className="flex items-center gap-3 md:text-right"><div className="flex h-[58px] w-[58px] items-center justify-center rounded-full" style={{ background: `conic-gradient(#a5b4fc ${progress}%, rgba(255,255,255,.12) 0)` }}><div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-slate-950 text-sm font-bold">{progress}%</div></div><div><p className="text-sm font-bold">{completed} of {total} complete</p><p className="mt-1 text-xs text-slate-400">Keep your momentum</p></div></div>
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"><BookOpen className="h-4 w-4" /> Switch plan</button>
                </div>
            </div>
        </section>
        <PlanSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>;
};

export default ProjectCard;
