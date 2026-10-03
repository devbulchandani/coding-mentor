import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowRight, Cpu, Clock3, BarChart3, Sparkles } from 'lucide-react';
import useAppStore from '../hooks/useAppStore';
import { planApi } from '../api/planApi';
import { getErrorMessage } from '../api/errorHandler';

const CreatePlan = () => {
    const navigate = useNavigate();
    const { setCurrentPlan, setMilestones, setRepoUrl } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ technology: '', duration: 5, level: 'Beginner', repoUrl: '' });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            const planData = await planApi.createPlan(form.technology, form.duration, form.level);
            setCurrentPlan({ id: planData.id, title: planData.projectName || planData.title, subtitle: form.repoUrl || planData.projectDescription || planData.subtitle, tech: planData.tech, durationDays: planData.durationDays, skillLevel: planData.skillLevel });
            setMilestones(planData.milestones || []); setRepoUrl(form.repoUrl); navigate('/dashboard');
        } catch (err) { console.error('Failed to create plan:', err); setError(getErrorMessage(err as any)); }
        finally { setIsLoading(false); }
    };

    return <div className="mx-auto max-w-3xl py-2 sm:py-6">
        <div className="mb-7"><p className="eyebrow">Start with a goal</p><h1 className="page-heading mt-1">Create a learning plan</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Tell us what you want to learn. We’ll shape it into a hands-on project and a roadmap you can follow.</p></div>
        <div className="surface overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-white px-6 py-5 sm:px-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-900">A project made for you</p><p className="mt-0.5 text-xs text-slate-500">You can adjust your plan at any time.</p></div></div></div>
            <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
                {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                <div><label htmlFor="technology" className="mb-2 block text-sm font-semibold text-slate-700">What do you want to learn?</label><div className="relative"><Cpu className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="technology" type="text" className="field pl-10" placeholder="Spring Boot, React, Node.js…" value={form.technology} onChange={(e) => setForm({ ...form, technology: e.target.value })} required /></div></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div><label htmlFor="duration" className="mb-2 block text-sm font-semibold text-slate-700">How much time do you have?</label><div className="relative"><Clock3 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><select id="duration" className="field appearance-none pl-10" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}><option value={5}>5 days</option><option value={10}>10 days</option><option value={30}>30 days</option></select></div></div>
                    <div><label htmlFor="level" className="mb-2 block text-sm font-semibold text-slate-700">Your current level</label><div className="relative"><BarChart3 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><select id="level" className="field appearance-none pl-10" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div></div>
                </div>
                <div><label htmlFor="repoUrl" className="mb-2 block text-sm font-semibold text-slate-700">GitHub repository <span className="font-normal text-slate-400">· Optional</span></label><div className="relative"><Github className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="repoUrl" type="url" className="field pl-10" placeholder="https://github.com/you/project" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} /></div><p className="mt-2 text-xs text-slate-400">Connect a repository to get code-aware mentor feedback.</p></div>
                <button type="submit" disabled={isLoading} className="button-primary w-full py-3.5">{isLoading ? <>Creating your roadmap…</> : <><Sparkles className="h-4 w-4" /> Generate my learning plan <ArrowRight className="ml-auto h-4 w-4" /></>}</button>
            </form>
        </div>
    </div>;
};

export default CreatePlan;
