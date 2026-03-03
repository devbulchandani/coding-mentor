import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Lock, Info, AlertCircle, Circle, Loader2, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAppStore from '../store/useAppStore';
import { verificationApi } from '../api/verificationApi';
import { getErrorMessage } from '../api/errorHandler';
import { milestoneApi } from '../api/mileStoneApi';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        primaryColor: '#f0f9ff',
        lineColor: '#38bdf8',
    }
});

const ChecklistItem = ({ text, checked, onToggle }) => (
    <div
        onClick={onToggle}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checked
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm'
            }`}
    >
        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${checked ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-300'
            }`}>
            {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <span className={`text-sm leading-relaxed ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
            {text}
        </span>
    </div>
);


const sanitizeMermaidLabel = (value = '') =>
    value
        .replace(/`/g, '')
        .replace(/"/g, '&quot;')
        .trim();

const normalizeMermaidChart = (value = '') =>
    value
        .replace(/^```mermaid\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .replace(/`/g, '')
        .replace(/<br\s*\/?>/gi, '<br/>')
        .replace(/;\s*$/gm, '')
        .trim()
        .replace(/\[([^\]]*?)\]/g, (_, label) => `[${sanitizeMermaidLabel(label)}]`)
        .replace(/\{([^{}]*?)\}/g, (_, label) => `{${sanitizeMermaidLabel(label)}}`);



const Mermaid = ({ chart }) => {
    const mermaidId = useId();
    const idRef = useRef(`mermaid-${mermaidId.replace(/:/g, '')}`);
    const [error, setError] = useState(null);
    const [svg, setSvg] = useState(null);

    useEffect(() => {
        if (!chart) return;

        const sanitized = normalizeMermaidChart(chart);

        const renderDiagram = async () => {
            try {
                // Clear previous error if any
                setError(null);
                const { svg } = await mermaid.render(`${idRef.current}-${Date.now()}`, sanitized);
                setSvg(svg);
            } catch (err) {
                console.error("Mermaid Render Error:", err);
                setError(err?.message || "Syntax error in diagram definition. Check for nested brackets or special characters.");
            }
        };

        renderDiagram();
    }, [chart]);

    if (error) return (
        <div className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-mono overflow-auto">
            <p className="font-bold mb-1">Diagram render error:</p>
            <pre>{error}</pre>
            <pre className="mt-2 text-slate-500">{chart}</pre>
        </div>
    );

    if (!svg) return (
        <div className="my-6 flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
        </div>
    );

    return (
        <div className="my-6 overflow-x-auto">
            <div
                className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

// ─── Code Block ───────────────────────────────────────────────────────────────

const LANGUAGE_META = {
    javascript: { label: 'JavaScript', dot: '#f7df1e' },
    js: { label: 'JS', dot: '#f7df1e' },
    typescript: { label: 'TypeScript', dot: '#3178c6' },
    ts: { label: 'TS', dot: '#3178c6' },
    python: { label: 'Python', dot: '#3572A5' },
    py: { label: 'Python', dot: '#3572A5' },
    bash: { label: 'Bash', dot: '#4EAA25' },
    sh: { label: 'Shell', dot: '#4EAA25' },
    json: { label: 'JSON', dot: '#f59e0b' },
    html: { label: 'HTML', dot: '#e34c26' },
    css: { label: 'CSS', dot: '#264de4' },
    sql: { label: 'SQL', dot: '#e38c00' },
    java: { label: 'Java', dot: '#b07219' },
    go: { label: 'Go', dot: '#00add8' },
    rust: { label: 'Rust', dot: '#dea584' },
    yaml: { label: 'YAML', dot: '#cb171e' },
};

const CodeBlock = ({ className, children }) => {
    const [copied, setCopied] = useState(false);
    const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text';
    const meta = LANGUAGE_META[lang] || { label: lang.toUpperCase(), dot: '#94a3b8' };
    const code = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="my-5 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg">
            {/* Titlebar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="mx-1 w-px h-4 bg-slate-600" />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                    <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">{meta.label}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-600/60 text-slate-400 hover:text-slate-200 transition-all border border-slate-600/40 select-none"
                >
                    {copied ? '✓ copied' : 'copy'}
                </button>
            </div>
            {/* Code with Syntax Highlighting */}
            <div className="bg-[#0f172a] overflow-x-auto text-sm">
                <SyntaxHighlighter
                    language={lang === 'code' ? 'text' : lang}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        background: 'transparent',
                        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
                        fontSize: '0.875rem',
                        lineHeight: '1.6'
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};


const InlineCode = ({ children }) => (
    <code className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-mono text-[0.85em] border border-sky-100 mx-0.5">
        {children}
    </code>
);


const notesComponents = {
    h1: ({ children }) => (
        <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b-2 border-sky-100 first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-xl font-bold text-slate-800 mt-7 mb-2.5 flex items-center gap-2 first:mt-0">
            <span className="w-1 h-5 rounded-full bg-sky-400 inline-block flex-shrink-0" />
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-xs font-bold text-slate-500 mt-5 mb-2 uppercase tracking-widest">{children}</h3>
    ),
    p: ({ children }) => (
        <p className="text-slate-600 leading-[1.8] my-3 text-[0.95rem]">{children}</p>
    ),
    ul: ({ children }) => <ul className="my-3 space-y-1.5 ml-1">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 space-y-1.5 ml-4 list-decimal">{children}</ol>,
    li: ({ children }) => (
        <li className="flex items-start gap-3 text-slate-600 text-[0.95rem] leading-relaxed mb-2">
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="flex-1">{children}</span>
        </li>
    ),
    blockquote: ({ children }) => (
        <blockquote className="my-6 pl-5 border-l-4 border-sky-400 bg-gradient-to-r from-sky-50 to-white py-4 pr-4 rounded-r-xl shadow-sm">
            <div className="flex gap-3 text-sky-800">
                <Info className="w-5 h-5 flex-shrink-0 text-sky-500 mt-0.5" />
                <div className="italic font-medium leading-relaxed">
                    {children}
                </div>
            </div>
        </blockquote>
    ),
    hr: () => (
        <hr className="my-7 border-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    ),
    strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
    em: ({ children }) => <em className="italic text-slate-500">{children}</em>,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-sky-600 underline underline-offset-2 decoration-sky-300 hover:text-sky-800 transition-colors">
            {children}
        </a>
    ),
    table: ({ children }) => (
        <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-50 border-b border-slate-200">{children}</thead>,
    th: ({ children }) => (
        <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wide">{children}</th>
    ),
    td: ({ children }) => <td className="px-4 py-3 text-slate-600 border-t border-slate-100">{children}</td>,
    code({ inline, className, children }) {
        const match = /language-(\w+)/.exec(className || '');
        if (!inline && match?.[1] === 'mermaid') {
            return (
                <div className="group relative">
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
                        Workflow Diagram
                    </div>
                    <Mermaid chart={String(children).replace(/\n$/, '')} />
                </div>
            );
        }
        if (!inline && match) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
        }
        return <InlineCode>{children}</InlineCode>;
    },
};

// ─── Main Component ────────────────────────────────────────────────────────────

const MilestoneDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { repoUrl, milestones, updateMilestoneStatus, currentPlan } = useAppStore();
    const [checklist, setChecklist] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState(null);
    const [notesLoading, setNotesLoading] = useState(true);

    useEffect(() => {
        const foundMilestone = milestones?.find(m => m.id === parseInt(id));
        if (foundMilestone) {
            setMilestone(foundMilestone);
            if (foundMilestone.learningObjectives) {
                const objectives = foundMilestone.learningObjectives
                    .split('\n').filter(obj => obj.trim())
                    .map((obj, index) => ({
                        id: index + 1,
                        text: obj.replace(/^[-*•]\s*/, '').trim(),
                        checked: foundMilestone.completed,
                    }));
                setChecklist(objectives);
            } else {
                setChecklist([
                    { id: 1, text: 'Understand the concepts', checked: foundMilestone.completed },
                    { id: 2, text: 'Implement the solution', checked: foundMilestone.completed },
                    { id: 3, text: 'Test your implementation', checked: foundMilestone.completed },
                ]);
            }
        }
        setLoading(false);
    }, [id, milestones]);

    const fetchNotes = useCallback(async () => {
        try {
            const fetchedNotes = await milestoneApi.getNotes(id);
            setNotes(fetchedNotes);

            if (fetchedNotes?.status === 'PENDING') {
                setTimeout(fetchNotes, 5000);
            } else {
                setNotesLoading(false);
            }
        } catch (error) {
            console.log('Notes not found yet or error:', error);
            setNotesLoading(false);
        }
    }, [id]);


    useEffect(() => {
        if (milestone) {
            fetchNotes();
        }
    }, [milestone, fetchNotes]);

    const handleCheckMilestone = async () => {
        if (!currentPlan) { setFeedback({ type: 'error', message: 'No active learning plan selected' }); return; }
        if (!repoUrl) { setFeedback({ type: 'error', message: 'Please provide a GitHub repository URL in your learning plan settings.' }); return; }
        setIsChecking(true);
        setFeedback(null);
        try {
            const result = await verificationApi.verifyMilestone(id, repoUrl);
            setFeedback({ type: result.completed ? 'success' : 'error', message: result.feedback });
            if (result.completed) {
                updateMilestoneStatus(parseInt(id), true);
                setChecklist(prev => prev.map(item => ({ ...item, checked: true })));
            }
        } catch (error) {
            setFeedback({ type: 'error', message: getErrorMessage(error) });
        } finally {
            setIsChecking(false);
        }
    };



    const handleGenerateNotes = async () => {
        try {
            setNotesLoading(true);
            await milestoneApi.generateNotes(id);
            fetchNotes();
        } catch (error) {
            console.error("Failed to trigger generation:", error);
            setNotesLoading(false);
        }
    };

    const toggleItem = (itemId) =>
        setChecklist(checklist.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));

    if (loading) return (
        <div className="max-w-4xl mx-auto pb-10 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
    );

    if (!milestone) return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-yellow-900 mb-2">Milestone Not Found</h2>
                <p className="text-yellow-700">The milestone you're looking for doesn't exist or hasn't been loaded yet.</p>
            </div>
        </div>
    );

    const getStatusInfo = () => {
        if (milestone.completed) return {
            badgeClasses: 'bg-mint-50 text-mint-700 border-mint-200',
            numberClasses: 'bg-mint-100 text-mint-600 border-mint-200',
            label: 'COMPLETED', icon: CheckCircle2,
        };
        const milestoneIndex = milestones.findIndex(m => m.id === milestone.id);
        const prev = milestoneIndex > 0 ? milestones[milestoneIndex - 1] : null;
        if (prev && !prev.completed) return {
            badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200',
            numberClasses: 'bg-slate-100 text-slate-600 border-slate-200',
            label: 'LOCKED', icon: Lock,
        };
        return {
            badgeClasses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            numberClasses: 'bg-yellow-100 text-yellow-600 border-yellow-200',
            label: 'IN PROGRESS', icon: Circle,
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${statusInfo.numberClasses}`}>
                            {milestone.sequenceNumber || id}
                        </span>
                        {milestone.title}
                    </h1>
                    <p className="text-slate-500 mt-2 ml-11">
                        Milestone {milestone.sequenceNumber || id} of {milestones?.length || 0}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClasses}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Goal */}
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-bold text-sky-900 mb-2">Goal</h3>
                                {milestone.description ? (
                                    <div className="text-sky-800 leading-relaxed prose prose-sm max-w-none">
                                        <ReactMarkdown>{milestone.description}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sky-800 leading-relaxed">
                                        Complete this milestone to progress in your learning journey.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ══ AI Concept Guide ══ */}
                    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Dark header */}
                        <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2.5 bg-gradient-to-r from-slate-800 to-slate-700">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30">
                                <Sparkles className="w-4 h-4 text-sky-300" />
                            </div>
                            <h3 className="font-bold text-white tracking-wide text-sm">AI Concept Guide</h3>
                            <div className="ml-auto flex items-center gap-3">
                                <button
                                    onClick={handleGenerateNotes}
                                    disabled={notesLoading || notes?.status === 'PENDING'}
                                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-sky-500 text-white hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                >
                                    {notesLoading || notes?.status === 'PENDING'
                                        ? 'Generating...'
                                        : notes?.markdownContent
                                            ? 'Regenerate Notes'
                                            : 'Generate Notes'}
                                </button>
                                <span className="text-xs text-slate-400 font-mono">Powered by Vertex AI</span>
                            </div>
                        </div>

                        <div className="bg-white">
                            {notesLoading || notes?.status === 'PENDING' ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map(i => (
                                            <span key={i}
                                                className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm">Generating your personalized study notes…</p>
                                </div>
                            ) : notes?.status === 'FAILED' ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
                                    <AlertCircle className="w-8 h-8" />
                                    <p className="text-sm">Failed to generate AI notes.</p>
                                </div>
                            ) : notes?.markdownContent ? (
                                <div className="px-7 py-6">
                                    <ReactMarkdown components={notesComponents}>
                                        {notes.markdownContent}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                                    <BookOpen className="w-8 h-8 text-slate-300" />
                                    <p className="text-sm">No study notes available for this milestone yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Checklist */}
                    {checklist.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-700">Learning Objectives</h3>
                            </div>
                            <div className="p-6 space-y-2">
                                {checklist.map(item => (
                                    <ChecklistItem key={item.id} text={item.text} checked={item.checked} onToggle={() => toggleItem(item.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                        <div className={`rounded-xl p-6 border flex gap-4 ${feedback.type === 'error' ? 'bg-lavender-50 border-lavender-200' : 'bg-mint-50 border-mint-200'}`}>
                            <div className="mt-1 flex-shrink-0">
                                {feedback.type === 'error'
                                    ? <AlertCircle className="w-5 h-5 text-accent" />
                                    : <CheckCircle2 className="w-5 h-5 text-mint-600" />
                                }
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold mb-1 ${feedback.type === 'error' ? 'text-accent' : 'text-mint-700'}`}>AI Feedback</h4>
                                <div className="text-slate-700 text-sm prose prose-sm max-w-none">
                                    <ReactMarkdown>{feedback.message}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4">Actions</h3>
                        <button
                            onClick={handleCheckMilestone}
                            disabled={isChecking || milestone.completed}
                            className="w-full bg-mint-500 hover:bg-mint-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-mint-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mb-3 flex items-center justify-center gap-2"
                        >
                            {isChecking ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                            ) : milestone.completed ? (
                                <><CheckCircle2 className="w-4 h-4" /> Completed</>
                            ) : 'Check Milestone'}
                        </button>
                        <p className="text-xs text-center text-slate-400">
                            {repoUrl ? "We'll scan your repo for changes." : 'Add a repository URL in settings first.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDetail;