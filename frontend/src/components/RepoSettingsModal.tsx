import { useState, useEffect } from 'react';
import { X, Github, Save, Loader2, AlertCircle } from 'lucide-react';
import { planApi } from '../api/planApi';
import { getErrorMessage } from '../api/errorHandler';
import useAppStore from '../hooks/useAppStore';

interface RepoSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RepoSettingsModal = ({ isOpen, onClose }: RepoSettingsModalProps) => {
    const { currentPlan, repoUrl, setRepoUrl } = useAppStore();
    const [githubUrl, setGithubUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGithubUrl(repoUrl || '');
            setError('');
            setSuccess(false);
        }
    }, [isOpen, repoUrl]);

    const handleSave = async () => {
        if (!currentPlan) {
            setError('No active learning plan selected');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await planApi.updateGitubUrl(currentPlan.id, githubUrl);
            setRepoUrl(githubUrl);
            setSuccess(true);
            
            // Auto-close after success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to update GitHub URL:', err);
            setError(getErrorMessage(err as any));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <Github className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Repository Settings</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Update your GitHub repository URL</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {!currentPlan ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">No Active Plan</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Please select or create a learning plan first.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Current Plan
                                </label>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                    <p className="font-medium text-slate-800">{currentPlan.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {currentPlan.tech} • {currentPlan.durationDays} days • {currentPlan.skillLevel}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    GitHub Repository URL
                                </label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="https://github.com/username/repository"
                                        value={githubUrl}
                                        onChange={(e) => {
                                            setGithubUrl(e.target.value);
                                            setError('');
                                            setSuccess(false);
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    This URL will be used for milestone verification and code analysis
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex gap-2">
                                    <Save className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>Repository URL updated successfully!</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !currentPlan || success}
                        className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepoSettingsModal;
