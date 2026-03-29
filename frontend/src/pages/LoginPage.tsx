import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function LoginPage() {
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
    <div className="bg-surface font-body text-on-surface overflow-hidden min-h-screen">
      <main className="flex min-h-screen w-full">
        {/* Left Section: UNTOUCHED */}
        <section className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-white to-slate-100 items-center px-20">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] bg-sky-100/30 rounded-full blur-3xl opacity-40"></div>
          
          <div className="relative z-10 w-full max-w-3xl">
            <div className="mb-24">
              <img src="/logo.png" alt="Autonex" className="h-10" />
              <div className="h-px w-12 bg-secondary mt-4"></div>
            </div>
            
            <h1 className="font-headline font-bold text-[5rem] leading-[1] tracking-tight text-primary mb-12">
              Executive <br/>
              <span className="text-secondary italic">Excellence</span> <br/>
              Starts Here
            </h1>
            
            <div className="flex items-start gap-12 mt-16">
              <div className="flex flex-col gap-2">
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">Protocol v.4.0</span>
                <p className="text-on-surface-variant max-w-xs leading-relaxed">
                  A sanctuary for architectural intelligence. Designed for leaders who demand clarity, precision, and a boundless digital landscape.
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] p-6 rounded-lg shadow-[0_20px_40px_-5px_rgba(30,58,138,0.06)] border-l-4 border-secondary translate-y-8">
                <span className="material-symbols-outlined text-secondary block mb-4">architecture</span>
                <div className="font-label text-xs font-bold text-primary tracking-wider">SYSTEM INTEGRITY</div>
                <div className="text-[10px] text-slate-500 mt-1">OPERATIONAL 100%</div>
              </div>
            </div>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[500px] h-[700px] rounded-lg overflow-hidden shadow-[0_20px_40px_-5px_rgba(30,58,138,0.06)] opacity-80">
            <img 
              className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700" 
              alt="Modern glass skyscraper facade" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5pqcANh7MfP_d_SjRuUs309e3IFdDg2hlew8LxdzGmH6rUqc7a01WK338migXQaDTxFocvEOfBxlvF-E0dskv5iXf5O3Wf3hCGZZMEte1YMbDC396ADHZ_Int21wDPsputbEZ6rMKTXcI0h5Sz-Yws88e7wh36k_PoOVP0kUPJClXNesNjyrKwtCEOnEevTcynoqc8KaEHZbpomIRYRxs9kTqXWywDpjkM5FWd9ih7arsXWFrMS9Q4CgYPoAYctQ4GAIXGkCDKdr2"
            />
          </div>
        </section>

        {/* Right Section: FIXED LOGIN BOX DESIGN */}
        <section className="w-full lg:w-2/5 bg-surface-container-low flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 py-24 relative overflow-y-auto">
          <div className="lg:hidden absolute top-8 left-6 sm:top-12 sm:left-12">
            <img src="/logo.png" alt="Autonex" className="h-8" />
          </div>
          
          {/* Enhanced Login Card - Using your original variables but adding depth */}
          <div className="w-full max-w-md bg-white p-6 sm:p-10 lg:p-12 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-outline-variant/20">
            <div className="mb-12">
              <h2 className="font-headline font-bold text-4xl text-primary tracking-tight">Portal Access</h2>
              <p className="text-on-surface-variant font-medium text-sm mt-3">Secure Gateway for Executive Members</p>
            </div>
            
            <form className="space-y-8" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span> {error}
                </div>
              )}
              
              {/* Email Input: Bold labels and defined focus states */}
              <div className="relative group">
                <label className="block font-label text-[11px] uppercase tracking-[0.2em] text-outline font-bold mb-2 group-focus-within:text-secondary transition-colors">
                  Corporate Email
                </label>
                <input 
                  className="w-full bg-white border-b-2 border-outline-variant/30 py-3 px-1 focus:ring-0 focus:border-secondary transition-all outline-none font-body text-on-surface placeholder:text-slate-300 text-base" 
                  placeholder="executive@autonex.ai" 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {/* Password Input: Clear contrast */}
              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label text-[11px] uppercase tracking-[0.2em] text-outline font-bold group-focus-within:text-secondary transition-colors">
                    Security Key
                  </label>
                  <a className="font-label text-[10px] uppercase tracking-widest text-outline hover:text-secondary transition-colors font-bold" href="#">Recover</a>
                </div>
                <input 
                  className="w-full bg-white border-b-2 border-outline-variant/30 py-3 px-1 focus:ring-0 focus:border-secondary transition-all outline-none font-body text-on-surface placeholder:text-slate-300 text-base" 
                  placeholder="••••••••••••" 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* CTA Actions */}
              <div className="pt-6 space-y-6">
                <button 
                  className="w-full bg-primary text-white py-5 rounded-xl font-label font-bold tracking-[0.2em] text-[11px] uppercase hover:bg-secondary active:scale-[0.98] transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Establish Connection'}
                </button>
                
                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary" />
                    <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold">Maintain Session</span>
                  </label>
                </div>
              </div>
            </form>
            
            {/* Footer Context */}
            <div className="mt-8 sm:mt-16 pt-8 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-xl font-bold">lock</span>
                </div>
                <div>
                  <p className="text-[10px] font-label font-bold text-primary tracking-widest uppercase">RSA-4096 Shield</p>
                  <p className="text-[9px] text-outline uppercase tracking-tighter">System integrity active</p>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-full px-6 sm:px-8 flex justify-between items-center max-w-md opacity-40">
            <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface font-bold">© 2024 AUTONEX</span>
            <div className="flex gap-6">
              <a className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface hover:text-secondary transition-colors" href="#">Privacy</a>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}