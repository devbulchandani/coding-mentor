import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../hooks/useAppStore';
import { Code, Terminal, Braces, Zap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAppStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isSignUp) {
                result = await register(name, email, password);
            } else {
                result = await login(email, password);
            }

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await login('devbulchandani876@gmail.com', '12345678');
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Demo login failed');
            }
        } catch (err) {
            setError('Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-indigo-300 to-lavender-400 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-10 left-10 text-white/20 animate-pulse">
                <Braces size={120} />
            </div>
            <div className="absolute bottom-10 right-10 text-white/20 animate-bounce delay-700">
                <Terminal size={80} />
            </div>
            <div className="absolute top-1/2 right-1/4 text-white/10 text-9xl font-mono pointer-events-none select-none">$</div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/50">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4 text-sky-600 shadow-inner">
                        <Code size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Buildspace AI</h1>
                    <p className="text-slate-500 font-medium italic">“Learn by building, not by watching.”</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            placeholder="dev@codementor.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2 gap-3 flex flex-col">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
                        </button>
                        
                        {!isSignUp && (
                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Try Demo Account
                            </button>
                        )}
                        
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="w-full bg-white hover:bg-slate-50 text-coral-500 border-2 border-coral-500 font-bold py-2.5 rounded-lg transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Login' : 'Create New Account'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 Buildspace AI. Built for Developers.
                </div>
            </div>
        </div>
    );
};

export default Login;
