import { useState, useEffect } from 'react';
import { X, Book, Clock, Target, CheckCircle2, Loader2, CodeSquareIcon } from 'lucide-react';
import { planApi } from '../api/planApi';
import { getErrorMessage } from '../api/errorHandler';
import useAppStore from '../hooks/useAppStore';

const PlanCard = ({ plan, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(plan)}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${
                isSelected
                    ? 'border-sky-500 bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm'
            }`}
        >
            {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
            )}
            
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-100' : 'bg-slate-100'}`}>
                    <Book className={`w-5 h-5 ${isSelected ? 'text-sky-600' : 'text-slate-600'}`} />
                </div>
                
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">{plan.projectName}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {plan.projectDescription || `Learn ${plan.tech}`}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
        </div>
    );
};

const PlanSelectorModal = ({ isOpen, onClose }) => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentPlan, setCurrentPlan, setMilestones, setRepoUrl } = useAppStore();

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await planApi.getMyPlans();
            setPlans(data);
            
            // Pre-select current plan if it exists
            if (currentPlan) {
                const current = data.find(p => p.id === currentPlan.id);
                if (current) setSelectedPlan(current);
            }
        } catch (err) {
            console.error('Failed to fetch plans:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = () => {
        if (selectedPlan) {
            setCurrentPlan({
                id: selectedPlan.id,
                title: selectedPlan.projectName,
                subtitle: selectedPlan.projectDescription,
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
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Select Learning Plan</h2>
                        <p className="text-sm text-slate-500 mt-1">Choose a plan to continue your learning journey</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
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
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSelectPlan}
                        disabled={!selectedPlan || loading}
                        className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Select Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanSelectorModal;
