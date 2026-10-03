import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Bot, User, AlertCircle, RefreshCw, Sparkles, Github, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAppStore from '../hooks/useAppStore';
import { chatApi } from '../api/chatApi';
import { getErrorMessage } from '../api/errorHandler';
import { ChatMessage as ChatMessageType } from '../types';
import PlanSelectorModal from '../components/PlanSelectorModal';

interface ChatMessageProps { role: ChatMessageType['role']; content: string; }
const ChatMessage = ({ role, content }: ChatMessageProps) => {
    const isUser = role === 'user';
    return <article className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isUser ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'}`}>{isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</span>
        <div className={`max-w-[88%] rounded-2xl px-4 py-3.5 sm:max-w-[78%] ${isUser ? 'rounded-tr-md bg-indigo-600 text-white' : 'rounded-tl-md border border-slate-200/80 bg-white text-slate-800 shadow-sm shadow-slate-900/[0.02]'}`}>
            {!isUser && <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600"><Sparkles className="h-3 w-3" /> Buildspace mentor</p>}
            <div className={`prose prose-sm max-w-none break-words leading-6 ${isUser ? 'prose-invert prose-p:text-white prose-strong:text-white' : 'prose-slate prose-headings:font-bold prose-a:text-indigo-700 prose-pre:rounded-xl'}`}><ReactMarkdown>{content}</ReactMarkdown></div>
        </div>
    </article>;
};

const Chat = () => {
    const { currentPlan, repoUrl, milestones } = useAppStore();
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMessages([{ role: 'assistant', content: currentPlan ? `Hi! I’m your mentor for **${currentPlan.title}**. Ask me to explain a concept, review your progress, or help you reason through a bug.` : 'Hi! I’m your AI mentor. Choose a learning plan and I’ll tailor our conversation to what you’re building.' }]), [currentPlan]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

    const handleSend = async (e: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        if (!currentPlan) { setMessages((prev) => [...prev, { role: 'assistant', content: 'Select a learning plan first so I can give you relevant guidance.' }]); return; }
        const message = input.trim();
        setMessages((prev) => [...prev, { role: 'user', content: message }]); setInput(''); setIsLoading(true);
        try {
            const response = await chatApi.sendMessage(currentPlan.id, message, repoUrl || '');
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) { setMessages((prev) => [...prev, { role: 'assistant', content: `I couldn’t complete that just now. ${getErrorMessage(error as any)}` }]); }
        finally { setIsLoading(false); }
    };

    const currentMilestone = milestones?.find((milestone) => !milestone.completed) || milestones?.[0];
    return <>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Think it through together</p><h1 className="page-heading mt-1">AI mentor</h1><p className="mt-1 text-sm text-slate-500">A little guidance, right when you need it.</p></div><button onClick={() => setShowPlanSelector(true)} className="button-secondary self-start sm:self-auto"><RefreshCw className="h-4 w-4" /> {currentPlan ? 'Switch plan' : 'Choose a plan'}</button></div>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section className="surface flex min-h-[68vh] flex-col overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-6"><span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Bot className="h-[18px] w-[18px]" /><span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">Your coding mentor</p><p className="truncate text-xs text-slate-400">{currentPlan?.title || 'Ready when you are'}</p></div>{repoUrl && <span title="Repository connected" className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex"><Github className="h-3 w-3" /> Repo connected</span>}</div>
                <div className="flex-1 space-y-5 overflow-y-auto bg-[#fafbfe] p-4 sm:p-6">{messages.map((message, index) => <ChatMessage key={index} role={message.role} content={message.content} />)}{isLoading && <div className="flex items-center gap-3 text-sm text-slate-500"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white"><Bot className="h-4 w-4" /></span><span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5"><Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> Thinking through it…</span></div>}<div ref={messagesEndRef} /></div>
                <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
                    {!currentPlan && <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"><AlertCircle className="h-4 w-4 shrink-0" /> Pick a plan to start a personalized conversation.</div>}
                    <form onSubmit={handleSend} className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10"><label htmlFor="mentor-message" className="sr-only">Message your mentor</label><textarea id="mentor-message" className="block max-h-36 min-h-[44px] w-full resize-y border-0 bg-transparent px-2.5 py-2 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0" placeholder={currentPlan ? 'Ask about your code, an idea, or what to try next…' : 'Choose a plan to get started…'} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }} disabled={!currentPlan || isLoading} /><div className="flex items-center justify-between px-1 pb-0.5"><span className="text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</span><button aria-label="Send message" type="submit" disabled={!input.trim() || isLoading || !currentPlan} className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"><Send className="h-4 w-4" /></button></div></form>
                </div>
            </section>
            <aside className="space-y-4">
                <div className="surface p-5"><p className="eyebrow">In context</p>{currentPlan ? <><h2 className="mt-2 text-base font-extrabold text-slate-900">{currentPlan.title}</h2><p className="mt-1 text-xs text-slate-500">{currentPlan.tech} · {currentPlan.skillLevel}</p>{currentMilestone && <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current milestone</p><p className="mt-1.5 text-sm font-semibold text-slate-700">{currentMilestone.title}</p></div>}{repoUrl && <a href={repoUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 truncate text-xs font-semibold text-indigo-700 hover:text-indigo-900"><Github className="h-3.5 w-3.5 shrink-0" />{repoUrl.replace(/^https?:\/\//, '')}</a>}</> : <div className="mt-3"><p className="text-sm text-slate-500">No active plan yet.</p><button onClick={() => setShowPlanSelector(true)} className="mt-3 text-sm font-bold text-indigo-700">Choose a plan →</button></div>}</div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm"><BookOpen className="h-4 w-4" /></span><h3 className="mt-3 text-sm font-bold text-slate-900">How I can help</h3><ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600"><li>Explain a concept in plain language</li><li>Explore the code in your repository</li><li>Help you decide what to try next</li></ul></div>
            </aside>
        </div>
        <PlanSelectorModal isOpen={showPlanSelector} onClose={() => setShowPlanSelector(false)} />
    </>;
};

export default Chat;
