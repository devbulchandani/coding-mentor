import { useState, useEffect, useCallback } from 'react';
import { X, Book, Clock, Target, CheckCircle2, Loader2, CodeSquareIcon } from 'lucide-react';
import { planApi } from '../api/planApi';
import { getErrorMessage } from '../api/errorHandler';
import { LearningPlan } from '../types';
import useAppStore from '../hooks/useAppStore';

interface PlanCardProps {
    plan: LearningPlan;
    isSelected: boolean;
    onSelect: (plan: LearningPlan) => void;
}

const PlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => {
    return (
        <button type="button"
            onClick={() => onSelect(plan)}
            className={`relative w-full rounded-2xl border p-4 text-left transition ${
                isSelected
                    ? 'border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/60'
            }`}
        >
            {isSelected && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
            )}
            
            <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2.5 ${isSelected ? 'bg-white' : 'bg-slate-100'}`}>
                    <Book className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                </div>
                
                <div className="flex-1">
                    <h3 className="mb-1 pr-7 text-sm font-extrabold text-slate-900">{plan.projectName || plan.title}</h3>
                    <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">
                        {plan.projectDescription || `Learn ${plan.tech}`}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{plan.durationDays} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>{plan.skillLevel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Book className="w-3 h-3" />
                            <span>{plan.milestones?.length || 0} milestones</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <CodeSquareIcon className="w-3 h-3" />
                            <span>{plan.tech} </span>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};

interface PlanSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlanSelectorModal = ({ isOpen, onClose }: PlanSelectorModalProps) => {
    const [plans, setPlans] = useState<LearningPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentPlan, setCurrentPlan, setMilestones, setRepoUrl } = useAppStore();

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await planApi.getMyPlans();
            setPlans(data);
            
            // Pre-select current plan if it exists
            if (currentPlan) {
                const current = data.find(p => p.id === currentPlan.id);
                if (current) setSelectedPlan(current);
                else setSelectedPlan(null);
            }
        } catch (err) {
            console.error('Failed to fetch plans:', err);
            setError(getErrorMessage(err as any));
        } finally {
            setLoading(false);
        }
    }, [currentPlan]);

    useEffect(() => {
        if (isOpen) fetchPlans();
    }, [isOpen, fetchPlans]);

    const handleSelectPlan = () => {
        if (selectedPlan) {
            setCurrentPlan({
                id: selectedPlan.id,
                title: selectedPlan.projectName || selectedPlan.title,
                subtitle: selectedPlan.projectDescription || selectedPlan.subtitle,
                tech: selectedPlan.tech,
                durationDays: selectedPlan.durationDays,
                skillLevel: selectedPlan.skillLevel
            });
            setMilestones(selectedPlan.milestones || []);
            setRepoUrl(selectedPlan.githubUrl || '');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-[3px] sm:p-5"
            onClick={onClose}
        >
            <div role="dialog" aria-modal="true" aria-labelledby="plan-selector-title"
                className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div>
                        <h2 id="plan-selector-title" className="text-lg font-extrabold text-slate-900">Choose a learning plan</h2>
                        <p className="mt-1 text-xs text-slate-500">Pick up where you left off.</p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="mb-3 h-7 w-7 animate-spin text-indigo-600" />
                            <p className="text-slate-500">Loading your plans...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-12">
                            <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 mb-2">No learning plans found</p>
                            <p className="text-sm text-slate-400">Create your first plan to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {plans.map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    isSelected={selectedPlan?.id === plan.id}
                                    onSelect={setSelectedPlan}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:px-5">
                    <button
                        onClick={onClose}
                        className="button-secondary py-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSelectPlan}
                        disabled={!selectedPlan || loading}
                        className="button-primary py-2"
                    >
                        Select Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanSelectorModal;
