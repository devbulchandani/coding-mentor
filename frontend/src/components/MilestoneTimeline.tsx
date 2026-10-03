import { Circle, LockKeyhole, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../hooks/useAppStore';
import { Milestone } from '../types';

type MilestoneState = 'completed' | 'active' | 'locked';
const MilestoneTimeline = () => {
    const { milestones } = useAppStore();
    const navigate = useNavigate();
    if (!milestones?.length) return <section className="surface p-8 text-center sm:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Sparkles className="h-5 w-5" /></div><h2 className="mt-4 text-lg font-bold text-slate-900">Your roadmap will appear here</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Create a learning plan to get a sequence of practical milestones tailored to your goals.</p></section>;

    const firstIncompleteIndex = milestones.findIndex((milestone) => !milestone.completed);
    const completed = milestones.filter((milestone) => milestone.completed).length;
    const roadmap = milestones.map((milestone: Milestone, index): Milestone & { state: MilestoneState } => ({
        ...milestone,
        state: milestone.completed ? 'completed' : index === firstIncompleteIndex ? 'active' : 'locked'
    }));

    return <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">The path ahead</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">Your roadmap</h2></div><span className="text-xs font-semibold text-slate-500">{completed} / {milestones.length} milestones complete</span></div>
        <div className="surface overflow-hidden"><div className="divide-y divide-slate-100">
            {roadmap.map((milestone, index) => {
                const Icon = milestone.state === 'completed' ? Check : milestone.state === 'active' ? Circle : LockKeyhole;
                const available = milestone.state !== 'locked';
                return <button key={milestone.id} onClick={() => navigate(`/milestone/${milestone.id}`)} disabled={!available} className={`group relative flex w-full items-start gap-4 px-5 py-5 text-left transition sm:px-6 ${available ? 'hover:bg-slate-50/80' : 'cursor-not-allowed opacity-55'}`}>
                    <span className={`relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${milestone.state === 'completed' ? 'bg-emerald-50 text-emerald-600' : milestone.state === 'active' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-slate-100 text-slate-400'}`}><Icon className="h-4 w-4" strokeWidth={2.2} /></span>
                    {index < roadmap.length - 1 && <span className="absolute bottom-[-1px] left-[42px] top-[58px] w-px bg-slate-200" />}
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {milestone.sequenceNumber || index + 1}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${milestone.state === 'completed' ? 'bg-emerald-50 text-emerald-700' : milestone.state === 'active' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{milestone.state === 'active' ? 'Up next' : milestone.state}</span></span><span className="mt-1 block truncate text-sm font-bold text-slate-800">{milestone.title}</span>{milestone.description && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{milestone.description}</span>}</span>
                    {available && <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />}
                </button>;
            })}
        </div></div>
    </section>;
};

export default MilestoneTimeline;
