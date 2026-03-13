import { MessageCircle, CheckCircle, RefreshCw, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    colorClass: string;
    onClick: () => void;
    bgColorClass: string;
}

const QuickAction = ({ icon: Icon, label, colorClass, onClick, bgColorClass }: QuickActionProps) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all hover:scale-105 hover:shadow-md ${bgColorClass} ${colorClass.replace('text', 'border')}`}
    >
        <div className={`p-3 rounded-full bg-white shadow-sm ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <span className="font-semibold text-sm text-slate-700">{label}</span>
    </button>
);

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
                icon={MessageCircle}
                label="Ask Mentor"
                colorClass="text-sky-600"
                bgColorClass="bg-sky-50 border-sky-100 hover:bg-sky-100"
                onClick={() => navigate('/chat')}
            />
            <QuickAction
                icon={CheckCircle}
                label="Check Progress"
                colorClass="text-mint-600"
                bgColorClass="bg-mint-50 border-mint-100 hover:bg-mint-100"
                onClick={() => console.log('Checking progress via API...')}
            />
            <QuickAction
                icon={RefreshCw}
                label="Refresh Repo"
                colorClass="text-lavender-600"
                bgColorClass="bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
                onClick={() => console.log('Refreshing...')}
            />
            <QuickAction
                icon={Map}
                label="View Roadmap"
                colorClass="text-coral-600"
                bgColorClass="bg-rose-50 border-rose-100 hover:bg-rose-100"
                onClick={() => navigate('/plans')}
            />
        </div>
    );
};

export default QuickActions;
