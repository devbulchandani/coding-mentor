import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Code2, Loader2, Sparkles } from 'lucide-react';
import useAppStore from '../hooks/useAppStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAppStore();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const result = isSignUp ? await register(name, email, password) : await login(email, password);
            if (result.success) navigate('/dashboard'); else setError(result.error || 'We couldn’t sign you in. Check your details and try again.');
        } catch { setError('We couldn’t connect just now. Please try again.'); }
        finally { setLoading(false); }
    };
    const handleDemoLogin = async () => {
        setError(''); setLoading(true);
        try { const result = await login('devbulchandani876@gmail.com', '12345678'); if (result.success) navigate('/dashboard'); else setError(result.error || 'Demo login failed'); }
        catch { setError('Demo login failed'); }
        finally { setLoading(false); }
    };
    const toggleMode = () => { setIsSignUp((value) => !value); setError(''); setName(''); setEmail(''); setPassword(''); };

    return <main className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
            <div className="absolute -right-32 top-1/4 h-[480px] w-[480px] rounded-full bg-indigo-600/25 blur-[110px]" /><div className="absolute -bottom-28 -left-20 h-[360px] w-[360px] rounded-full bg-violet-500/15 blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(to bottom right, black, transparent 70%)' }} />
            <a href="/" className="relative inline-flex w-fit items-center gap-2.5 text-sm font-extrabold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500"><Code2 className="h-5 w-5" /></span>Buildspace<span className="text-indigo-300">.</span></a>
            <div className="relative max-w-xl py-16"><span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Learn by making</span><h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight xl:text-5xl">Your next great idea starts with <span className="text-indigo-300">one small step.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Build real projects, follow a roadmap that makes sense, and get thoughtful guidance whenever you’re stuck.</p><div className="mt-9 space-y-3">{['Project-based learning paths', 'Milestones that keep you moving', 'An AI mentor that learns your context'].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-medium text-slate-200"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="h-3 w-3" /></span>{item}</p>)}</div></div>
            <p className="relative text-xs text-slate-500">Build something you’re proud of.</p>
        </section>
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-[420px]">
                <div className="mb-10 flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"><Code2 className="h-5 w-5" /></span>Buildspace<span className="-ml-2 text-indigo-600">.</span></div>
                <div className="mb-8"><p className="eyebrow">{isSignUp ? 'Get started' : 'Welcome back'}</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{isSignUp ? 'Create your account' : 'Sign in to Buildspace'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? 'Start learning through projects built around your goals.' : 'Your projects and progress are right where you left them.'}</p></div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700">{error}</div>}
                    {isSignUp && <div><label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Name</label><input id="name" autoComplete="name" className="field" placeholder="How should we call you?" value={name} onChange={(e) => setName(e.target.value)} required /></div>}
                    <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input id="email" type="email" autoComplete="email" className="field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input id="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} className="field" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
                    <button type="submit" disabled={loading} className="button-primary w-full py-3 text-sm">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</> : <>{isSignUp ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" /></>}</button>
                </form>
                {!isSignUp && <div className="mt-5 text-center"><button type="button" onClick={handleDemoLogin} disabled={loading} className="text-xs font-semibold text-slate-400 transition hover:text-indigo-700">Explore with demo account</button></div>}
                <p className="mt-8 text-center text-sm text-slate-500">{isSignUp ? 'Already have an account?' : 'New to Buildspace?'} <button onClick={toggleMode} className="font-bold text-indigo-700 hover:text-indigo-900">{isSignUp ? 'Sign in' : 'Create an account'}</button></p>
                <p className="mt-12 text-center text-[11px] text-slate-400">Build something you’re proud of.</p>
            </div>
        </section>
    </main>;
};

export default Login;
