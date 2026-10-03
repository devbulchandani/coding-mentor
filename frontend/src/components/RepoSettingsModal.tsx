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
        <div role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-[3px] sm:p-5"
            onClick={onClose}
        >
            <div role="dialog" aria-modal="true" aria-labelledby="repo-settings-title"
                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl shadow-slate-950/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-50 p-2.5">
                            <Github className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                            <h2 id="repo-settings-title" className="text-base font-extrabold text-slate-900">Repository settings</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Connect the code you’re learning from.</p>
                        </div>
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
                <div className="space-y-5 p-5 sm:p-6">
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
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                            <p className="text-sm font-bold text-slate-800">{currentPlan.title}</p>
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
                                        className="field pl-10"
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
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    This URL will be used for milestone verification and code analysis
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div role="status" className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    <Save className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>Repository URL updated successfully!</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:px-6">
                    <button
                        onClick={onClose}
                        className="button-secondary py-2"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !currentPlan || success}
                        className="button-primary py-2"
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
