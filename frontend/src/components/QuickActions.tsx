import { createElement } from 'react';
import { MessageCircle, CheckCircle, Github, Map, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionProps { icon: LucideIcon; label: string; onClick: () => void; }
const QuickAction = ({ icon, label, onClick }: QuickActionProps) => <button onClick={onClick} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{createElement(icon, { className: 'h-4 w-4' })}</span><span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</span></button>;

const QuickActions = () => {
    const navigate = useNavigate();
    return <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><QuickAction icon={MessageCircle} label="Ask mentor" onClick={() => navigate('/chat')} /><QuickAction icon={CheckCircle} label="Check progress" onClick={() => navigate('/dashboard')} /><QuickAction icon={Github} label="Connect repository" onClick={() => navigate('/dashboard')} /><QuickAction icon={Map} label="Create learning plan" onClick={() => navigate('/create-plan')} /></div>;
};

export default QuickActions;
