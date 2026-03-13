import { useState, useRef, useEffect } from 'react';
import { Send, Code2, Bot, User, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAppStore from '../hooks/useAppStore';
import { chatApi } from '../api/chatApi';
import { getErrorMessage } from '../api/errorHandler';
import { ChatMessage as ChatMessageType } from '../types';
import PlanSelectorModal from '../components/PlanSelectorModal';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
    const isUser = role === 'user';
    return (
        <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-sky-100 text-sky-600' : 'bg-lavender-100 text-accent'}`}>
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isUser
                    ? 'bg-sky-50 text-slate-800 border border-sky-100 rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                <div className="text-xs font-semibold mb-1 opacity-50 uppercase tracking-widest">
                    {isUser ? 'You' : 'Mentor AI'}
                </div>
                <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

const Chat = () => {
    const { currentPlan, repoUrl, milestones } = useAppStore();
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with welcome message
    useEffect(() => {
        if (currentPlan) {
            setMessages([{
                role: 'assistant',
                content: `Hi! I'm your AI mentor for **${currentPlan.title}**. I can help you understand concepts, debug issues, and guide you through your learning journey. What would you like to know?`
            }]);
        } else {
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm your AI mentor. Please select or create a learning plan to get started with personalized guidance."
            }]);
        }
    }, [currentPlan]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!currentPlan) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Please select or create a learning plan first. I need to know what you're working on to provide relevant guidance."
            }]);
            return;
        }

        const userMessage: ChatMessageType = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(
                currentPlan.id,
                input,
                repoUrl || ''
            );

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I'm sorry, I encountered an error: ${getErrorMessage(error as any)}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Get current milestone (first incomplete one)
    const currentMilestone = milestones?.find(m => !m.completed) || milestones?.[0];

    return (
        <>
            <div className="flex h-[calc(100vh-8rem)] gap-6">
                {/* Left Panel - Context */}
                <div className="w-80 hidden lg:flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-shrink-0">
                        <h3 className="font-bold text-slate-700 mb-2">Current Context</h3>

                        {currentPlan ? (
                            <>
                                <div className="mb-4">
                                    <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Learning Plan</div>
                                    <div className="text-sm font-medium text-slate-800">{currentPlan.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {currentPlan.tech} • {currentPlan.skillLevel}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPlanSelector(true)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium rounded-lg transition-colors border border-sky-200 mb-4"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Change Plan
                                </button>

                                {currentMilestone && (
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Current Milestone</div>
                                        <div className="text-sm font-medium text-slate-800">{currentMilestone.title}</div>
                                    </div>
                                )}

                                {repoUrl && (
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Repository</div>
                                        <a 
                                            href={repoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-sky-600 hover:underline break-all"
                                        >
                                            {repoUrl.replace('https://', '').replace('http://', '')}
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-slate-500 py-4">
                                No active learning plan selected
                            </div>
                        )}
                    </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-1 overflow-y-auto">
                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        AI Capabilities
                    </h3>
                    <div className="space-y-3 text-xs text-indigo-800">
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <p>Analyzes your GitHub repository code</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <p>Provides Socratic guidance (asks questions instead of giving answers)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <p>Understands your learning context and milestones</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                            <p>Helps debug and explain concepts</p>
                        </div>
                    </div>

                    {!repoUrl && currentPlan && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-yellow-800 mb-1">No Repository Set</p>
                                    <p className="text-xs text-yellow-700">
                                        Add your GitHub URL in Repository Settings for code analysis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {messages.map((m, i) => (
                        <ChatMessage key={i} role={m.role} content={m.content} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    {!currentPlan && (
                        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">
                                Please select or create a learning plan to start chatting with your AI mentor.
                            </p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSend} className="relative">
                        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all">
                            <textarea
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 px-2 text-slate-700 placeholder:text-slate-400 outline-none"
                                placeholder={currentPlan ? "Ask anything about your code..." : "Select a plan to start chatting..."}
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                disabled={!currentPlan}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || !currentPlan}
                                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {showPlanSelector && (
            <PlanSelectorModal isOpen={showPlanSelector} onClose={() => setShowPlanSelector(false)} />
        )}
    </>
    );
};

export default Chat;
