import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowRight, LogIn } from 'lucide-react';
import '../styles/design-system.css';

export default function LoginUnified() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useStore(s => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container bg-slate-50 relative overflow-hidden font-body">
      {/* Top Stripe */}
      <div className="absolute top-0 left-0 w-full h-1.5 z-50 bg-gradient-to-r from-[#1E40AF] to-[#0EA5E9]" />

      {/* Brand Panel (Left) */}
      <div className="auth-brand-panel bg-[#1E40AF] text-white p-12">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top right, #0EA5E9, transparent 60%)' }} />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Autonex" className="h-10 brightness-0 invert" />
              <span className="glass-badge text-sky-100 border-sky-300/30">Candidate Portal</span>
            </div>
          </div>
          
          <div className="mt-24 mb-auto">
            <h1 className="text-5xl font-bold mb-6 font-display leading-tight">
              Welcome to <br/><span className="text-[#0EA5E9]">Autonex</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed mb-12 font-body font-light">
              Your seamless Employee Onboarding Platform. Access your modules, track your progress, and get started on your journey.
            </p>
          </div>
          
          <div className="text-sm text-blue-200 opacity-60 font-body">
            &copy; {new Date().getFullYear()} Autonex Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="auth-form-panel bg-white">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Mobile Logo ONLY */}
          <div className="lg:hidden flex justify-center mb-8">
             <img src="/logo.png" alt="Autonex" className="h-10" />
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-3 sm:mx-0 sm:mt-0 bg-blue-50 rounded-xl mb-6">
               <LogIn className="h-8 w-8 text-[#1E40AF]" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-body">Sign in to your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 font-body">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com"
                className="auth-input font-body" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 font-body">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="auth-input font-body" />
            </div>

            <button type="submit" disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:-translate-y-0.5"
              style={{ backgroundColor: '#1E40AF' }}>
              {loading ? 'Processing...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
