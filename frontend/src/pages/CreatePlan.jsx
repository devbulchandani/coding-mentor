import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Play, Cpu, Clock, BarChart } from 'lucide-react';
import useAppStore from '../hooks/useAppStore';
import { planApi } from '../api/planApi';
import { getErrorMessage } from '../api/errorHandler';

const CreatePlan = () => {
    const navigate = useNavigate();
    const { setCurrentPlan, setMilestones, setRepoUrl } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [form, setForm] = useState({
        technology: '',
        duration: 5,
        level: 'Beginner',
        repoUrl: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const planData = await planApi.createPlan(
                form.technology,
                form.duration,
                form.level
            );

            setCurrentPlan({
                id: planData.id,
                title: planData.projectName,
                subtitle: form.repoUrl || planData.projectDescription,
                tech: planData.tech,
                durationDays: planData.durationDays,
                skillLevel: planData.skillLevel
            });

            setMilestones(planData.milestones || []);
            setRepoUrl(form.repoUrl);

            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to create plan:', err);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Create your learning journey</h1>
                <p className="text-slate-500">Tell us what you want to build, and we'll generate a step-by-step roadmap.</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Technology */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            I want to learn...
                        </label>
                        <div className="relative">
                            <Cpu className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="Spring Boot, React, Node.js..."
                                value={form.technology}
                                onChange={e => setForm({ ...form, technology: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Duration
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <select
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white appearance-none"
                                    value={form.duration}
                                    onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                                >
                                    <option value={5}>5 days</option>
                                    <option value={10}>10 days</option>
                                    <option value={30}>30 days</option>
                                </select>
                            </div>
                        </div>

                        {/* Skill Level */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Skill Level
                            </label>
                            <div className="relative">
                                <BarChart className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                <select
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white appearance-none"
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: e.target.value })}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Repo URL */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            GitHub Repository (Optional)
                        </label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="url"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="https://github.com/username/project"
                                value={form.repoUrl}
                                onChange={e => setForm({ ...form, repoUrl: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>Generating your plan... ⏳</>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                Generate Learning Plan
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePlan;
