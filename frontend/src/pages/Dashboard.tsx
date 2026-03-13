import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import MilestoneTimeline from '../components/MilestoneTimeline';
import RepoSettingsModal from '../components/RepoSettingsModal';
import useAppStore from '../hooks/useAppStore';
import { Settings } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAppStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Hi, {user?.name || 'Developer'}! 👋
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-sky-600 border border-slate-200 hover:border-sky-300 rounded-lg font-medium transition-all shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Repository Settings
                    </button>
                </div>
            </div>

            <ProjectCard />
            <MilestoneTimeline />

            <RepoSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;
