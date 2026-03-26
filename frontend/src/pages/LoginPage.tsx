import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'candidate' | 'admin'>('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const login = useStore(s => s.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, name || (role === 'admin' ? 'Admin User' : 'Alex Sterling'), email || 'user@company.com');
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const quickLogin = (r: 'candidate' | 'admin') => {
    login(r, r === 'admin' ? 'Admin User' : 'Alex Sterling', r === 'admin' ? 'admin@company.com' : 'alex.s@company.com');
    navigate(r === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)' }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Autonex" className="h-12 mx-auto brightness-0 invert mb-4" />
          <p className="text-blue-300 text-sm">Employee Onboarding Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Toggle */}
            <div className="flex rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {(['candidate', 'admin'] as const).map(r => (
                <button key={r} type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    role === r ? 'text-white shadow-md' : 'text-blue-300 hover:text-white'
                  }`}
                  style={role === r ? { background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' } : {}}>
                  {r === 'candidate' ? '👤 Candidate' : '🛡️ Admin'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder={role === 'admin' ? 'Admin User' : 'Alex Sterling'}
                className="w-full px-4 py-3 rounded-lg text-white placeholder-blue-400/50 outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', focusRingColor: '#0EA5E9' }} />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-blue-400/50 outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold text-sm shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
              Sign In <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-blue-400 text-center mb-3">Quick Demo Access</p>
            <div className="flex gap-3">
              <button onClick={() => quickLogin('candidate')}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-blue-200 transition-colors hover:text-white cursor-pointer"
                style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                Demo as Candidate
              </button>
              <button onClick={() => quickLogin('admin')}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-blue-200 transition-colors hover:text-white cursor-pointer"
                style={{ background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.3)' }}>
                Demo as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
