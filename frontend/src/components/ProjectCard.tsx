import { useState } from 'react';
import { Book, Clock, Target, ExternalLink, Github, RefreshCw, CodeSquareIcon } from 'lucide-react';
import useAppStore from '../hooks/useAppStore';
import PlanSelectorModal from './PlanSelectorModal';
import LiveMentor from './LiveMentor';

const ProjectCard = () => {
    const { currentPlan, repoUrl, milestones } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!currentPlan) {
        return (
            <>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500">
                            No active learning plan. Create one to get started!
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 bg-white px-4 py-2 rounded-lg border border-sky-200 hover:border-sky-300 shadow-sm transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Select Plan
                        </button>
                    </div>
                </div>

                <PlanSelectorModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                />
            </>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-r from-sky-50 to-mint-50 border border-sky-100 rounded-xl p-6 shadow-sm mb-8 relative group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Book className="w-5 h-5 text-sky-600" />
                            <h2 className="text-xl font-bold text-slate-800">{currentPlan.title}</h2>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{currentPlan.durationDays || 5} days</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-slate-400" />
                                <span>{currentPlan.skillLevel || 'Beginner'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CodeSquareIcon className="w-4 h-4 text-slate-400" />
                                <span>{currentPlan.tech || 'Beginner'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {repoUrl && (
                            <a 
                                href={repoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 bg-white/80 px-3 py-1.5 rounded-full border border-sky-100 shadow-sm transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                {repoUrl.replace('https://', '').substring(0, 30)}...
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        )}
                        
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-sky-600 bg-white/80 hover:bg-white px-4 py-1.5 rounded-full border border-slate-200 hover:border-sky-300 shadow-sm transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Change Plan
                        </button>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute top-4 right-1/2 opacity-5 pointer-events-none">
                    <Target size={100} />
                </div>
            </div>

            <PlanSelectorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
};

export default ProjectCard;
