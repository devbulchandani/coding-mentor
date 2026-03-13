import { useVoiceMentor } from '../hooks/useVoiceMentor';
import useAppStore from '../hooks/useAppStore';
import { useMemo } from 'react';

interface LiveMentorProps {
    planId: string | undefined;
    milestoneId: number | undefined;
}

export default function LiveMentor() {
    const { currentPlan, milestones } = useAppStore();

    const targetMilestone = useMemo(() => {
        if (!milestones || milestones.length === 0) return null;

        const nextPending = milestones.find(m => !m.completed);
        return nextPending ? nextPending : milestones[milestones.length - 1];
    }, [milestones]);

    const planId = currentPlan?.id?.toString();
    const milestoneId = targetMilestone?.id;   
    
    const { startCall, endCall, isConnected, isConnecting } = useVoiceMentor(
        planId, 
        milestoneId
    );

    if (!planId || !milestoneId) {
        return (
            <div className="p-4 bg-slate-800/50 rounded-lg text-slate-400 text-sm text-center border border-slate-700">
                Create a plan to unlock your AI Mentor.
            </div>
        );
    }
    return (
        <div className="p-4 bg-slate-800 rounded-lg text-white text-center shadow-lg border border-slate-700">
            <h3 className="text-sm font-bold mb-3 text-slate-200">🎙️ Live AI Mentor</h3>

            {!isConnected ? (
                <button
                    onClick={startCall}
                    disabled={isConnecting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-bold transition disabled:opacity-50"
                >
                    {isConnecting ? "Connecting..." : "Start Call"}
                </button>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full animate-pulse mb-2 flex items-center justify-center border border-green-500">
                        <span className="text-xl">🗣️</span>
                    </div>
                    <p className="mb-3 text-xs text-green-400 font-medium">Listening...</p>
                    <button
                        onClick={endCall}
                        className="w-full py-2 bg-red-600/20 text-red-400 border border-red-600 hover:bg-red-600 hover:text-white rounded-md text-sm font-bold transition"
                    >
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
}
