import React from 'react';
import { useVoiceMentor } from '../hooks/useVoiceMentor';

export default function LiveMentor({ planId, milestoneId }) {
    // Pass the IDs to the hook
    const { startCall, endCall, isConnected, isConnecting } = useVoiceMentor(planId, milestoneId);

    return (
        <div className="p-6 bg-slate-800 rounded-lg text-white text-center shadow-lg">
            <h2 className="text-xl font-bold mb-4">🎤 Live AI Mentor</h2>
            
            {!isConnected ? (
                <button 
                    onClick={startCall}
                    disabled={isConnecting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition disabled:opacity-50"
                >
                    {isConnecting ? "Connecting to Vertex AI..." : "Start Voice Call"}
                </button>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full animate-pulse mb-4 flex items-center justify-center">
                        <span className="text-2xl">🗣️</span>
                    </div>
                    <p className="mb-4 text-green-400">Call is active. Start speaking!</p>
                    <button 
                        onClick={endCall}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full font-bold transition"
                    >
                        End Call
                    </button>
                </div>
            )}
            
            <p className="text-sm text-slate-400 mt-6">
                <strong>Tip:</strong> You can interrupt the AI at any time by just speaking over it.
            </p>
        </div>
    );
}