import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, TrendingUp, CheckCircle2, Download } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    completedCandidates: 0,
    avgProgress: 0
  });
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => {
        setMetrics({
          totalCandidates: data.metrics.totalCandidates || 0,
          activeCandidates: data.metrics.totalCandidates || 0, // Active inferred
          completedCandidates: 0,
          avgProgress: data.metrics.avgProgress || 0
        });
        setCandidates(data.recentCandidates.map((c: any) => ({
          ...c,
          progress: Math.floor(Math.random() * 50) + 10, // Simulated progress until tracking table exists
          status: 'active',
          mentor: 'Unassigned'
        })));
      })
      .catch(console.error);
  }, []);

  const stats = [
    { label: 'Total Candidates', value: metrics.totalCandidates, icon: Users, color: '#1E40AF', bg: '#eff6ff' },
    { label: 'Active Now', value: metrics.activeCandidates, icon: TrendingUp, color: '#0EA5E9', bg: '#f0f9ff' },
    { label: 'Completed', value: metrics.completedCandidates, icon: CheckCircle2, color: '#10B981', bg: '#ecfdf5' },
    { label: 'Avg Progress', value: `${metrics.avgProgress}%`, icon: LayoutDashboard, color: '#F59E0B', bg: '#fffbeb' },
  ];

  const statusColor = (status: string) => {
    if (status === 'active') return { bg: '#ecfdf5', color: '#065f46' };
    if (status === 'completed') return { bg: '#eff6ff', color: '#1E40AF' };
    return { bg: '#fef3c7', color: '#92400e' };
  };

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1E40AF, #1E3A8A)' }}>
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Admin Dashboard</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>Onboarding analytics and candidate management</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition-shadow hover:shadow-lg w-full sm:w-auto justify-center"
            style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <div className="glass-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl flex-shrink-0" style={{ background: stat.bg, color: stat.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold" style={{ color: '#0F172A' }}>{stat.value}</p>
                  <p className="text-xs font-medium truncate" style={{ color: '#64748B' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="glass-card overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>All Candidates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Candidate</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: '#64748B' }}>Department</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#64748B' }}>Mentor</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Progress</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => {
                  const sColor = statusColor(c.status);
                  return (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate" style={{ color: '#0F172A' }}>{c.name}</p>
                            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 hidden sm:table-cell" style={{ color: '#64748B' }}>{c.department}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 hidden md:table-cell" style={{ color: '#64748B' }}>{c.mentor}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                            <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.progress === 100 ? '#10B981' : '#1E40AF' }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#64748B' }}>{c.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: sColor.bg, color: sColor.color }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
