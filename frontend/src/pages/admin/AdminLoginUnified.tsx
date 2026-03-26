import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Shield, ArrowRight, Lock, Database, Search } from 'lucide-react';
import '../../styles/design-system.css';

export default function AdminLoginUnified() {
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
      
      if (data.user.role !== 'admin' && data.user.role !== 'ADMIN') {
         throw new Error('Unauthorized Access. Need Admin Permissions.');
      }
      
      login(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container bg-slate-50 relative overflow-hidden font-body">
      {/* Top Stripe */}
      <div className="absolute top-0 left-0 w-full h-1.5 z-50 bg-gradient-to-r from-[#0D1B4C] to-[#2563EB]" />

      {/* Brand Panel (Left) */}
      <div className="auth-brand-panel bg-[#0D1B4C] text-white p-12">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top right, #2563EB, transparent 70%)' }} />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Autonex" className="h-10 brightness-0 invert" />
              <span className="glass-badge text-blue-100 border-blue-500/30 font-display uppercase tracking-widest text-xs">Admin Portal</span>
            </div>
          </div>
          
          <div className="mt-24 mb-auto">
            <h1 className="text-4xl font-bold mb-6 font-display leading-tight">
              AI-Powered <br/><span className="text-[#2563EB]">Recruitment Suite</span>
            </h1>
            <p className="text-blue-200 text-lg max-w-md leading-relaxed mb-12 font-body font-light">
              Manage talent pipelines, analyze assessment scores, and accelerate the hiring process with our enterprise tools.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white font-medium bg-white/5 p-4 rounded-xl border border-white/10">
                <Search className="text-[#2563EB] h-6 w-6" /> Candidate Management
              </div>
              <div className="flex items-center gap-4 text-white font-medium bg-white/5 p-4 rounded-xl border border-white/10">
                <Database className="text-[#2563EB] h-6 w-6" /> Real-time Analytics
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-blue-300 opacity-80 font-body">
            <Lock className="h-3 w-3" /> Secure Enterprise Environment
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

          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 sm:mx-0 sm:mt-0 bg-blue-50 rounded-xl mb-6">
               <Shield className="h-8 w-8 text-[#0D1B4C]" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Admin Login</h2>
            <p className="text-slate-500 font-body">Access your administrative dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"><Lock className="h-4 w-4"/> {error}</div>}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 font-body">Corporate Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@autonex.com"
                className="auth-input admin-input font-body bg-slate-50" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 font-body">Security Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="auth-input admin-input font-body bg-slate-50" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl text-white font-bold text-base shadow-lg shadow-[#0D1B4C]/20 transition-all hover:shadow-[#0D1B4C]/40 hover:-translate-y-0.5"
              style={{ backgroundColor: '#0D1B4C' }}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-12 text-center text-xs text-slate-400 max-w-[16rem] mx-auto leading-relaxed">
            By logging in, you agree to Autonex's strict enterprise security compliance policies.
          </p>
        </div>
      </div>
    </div>
  );
}
