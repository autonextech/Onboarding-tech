import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, TrendingUp, CheckCircle2, Download, UserX } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    inactiveCandidates: 0,
    completedCandidates: 0,
    avgProgress: 0,
    totalModules: 0
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Fetch all users and all published modules/progress in parallel
      const [usersRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/users`).then(r => r.json()),
        fetch(`${API_URL}/api/analytics/dashboard`).then(r => r.json())
      ]);

      const allCandidates = usersRes.filter((u: any) => u.role === 'CANDIDATE');
      const activeCandidates = allCandidates.filter((u: any) => u.isActive);
      const inactiveCandidates = allCandidates.filter((u: any) => !u.isActive);

      // Fetch real progress for each active candidate
      const candidatesWithProgress = await Promise.all(
        allCandidates.map(async (c: any) => {
          try {
            const dashRes = await fetch(`${API_URL}/api/candidates/${c.id}/dashboard`);
            const dashData = await dashRes.json();
            return {
              ...c,
              progress: dashData.stats?.overallProgress || 0,
              status: !c.isActive ? 'inactive' : (dashData.stats?.overallProgress === 100 ? 'completed' : 'active'),
              mentorName: c.mentor?.name || 'Unassigned',
              quizScore: dashData.stats?.avgQuizScore || 0
            };
          } catch {
            return { ...c, progress: 0, status: c.isActive ? 'active' : 'inactive', mentorName: 'Unassigned', quizScore: 0 };
          }
        })
      );

      const completedCount = candidatesWithProgress.filter(c => c.progress === 100).length;
      const totalProgress = candidatesWithProgress.reduce((acc: number, c: any) => acc + c.progress, 0);
      const avgProg = candidatesWithProgress.length > 0 ? Math.round(totalProgress / candidatesWithProgress.length) : 0;

      setMetrics({
        totalCandidates: allCandidates.length,
        activeCandidates: activeCandidates.length,
        inactiveCandidates: inactiveCandidates.length,
        completedCandidates: completedCount,
        avgProgress: avgProg,
        totalModules: analyticsRes.metrics?.totalModules || 0
      });

      setCandidates(candidatesWithProgress);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Candidates', value: metrics.totalCandidates, icon: Users, color: '#7E22CE', bg: '#faf5ff' },
    { label: 'Active Now', value: metrics.activeCandidates, icon: TrendingUp, color: '#0EA5E9', bg: '#f0f9ff' },
    { label: 'Completed', value: metrics.completedCandidates, icon: CheckCircle2, color: '#10B981', bg: '#ecfdf5' },
    { label: 'Avg Progress', value: `${metrics.avgProgress}%`, icon: LayoutDashboard, color: '#F59E0B', bg: '#fffbeb' },
  ];

  const statusColor = (status: string) => {
    if (status === 'active') return { bg: '#ecfdf5', color: '#065f46' };
    if (status === 'completed') return { bg: '#eff6ff', color: '#1E40AF' };
    if (status === 'inactive') return { bg: '#fef2f2', color: '#991b1b' };
    return { bg: '#fef3c7', color: '#92400e' };
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autonex_candidates_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #7E22CE, #581C87)' }}>
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Admin Dashboard</h2>
              <p className="text-sm" style={{ color: '#64748B' }}>Real-time onboarding analytics</p>
            </div>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition-shadow hover:shadow-lg w-full sm:w-auto justify-center"
            style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
            <Download className="h-4 w-4" /> Export CSV
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
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>All Candidates</h3>
            {metrics.inactiveCandidates > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 flex items-center gap-1">
                <UserX className="h-3 w-3" /> {metrics.inactiveCandidates} Inactive
              </span>
            )}
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
                {candidates.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic">No candidates yet.</td></tr>
                ) : candidates.map(c => {
                  const sColor = statusColor(c.status);
                  return (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: c.isActive ? 'linear-gradient(135deg, #7E22CE, #A855F7)' : '#94a3b8' }}>
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate" style={{ color: c.isActive ? '#0F172A' : '#94a3b8' }}>{c.name}</p>
                            <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 hidden sm:table-cell" style={{ color: '#64748B' }}>{c.department || 'N/A'}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 hidden md:table-cell" style={{ color: '#64748B' }}>{c.mentorName}</td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                            <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.progress === 100 ? '#10B981' : '#7E22CE' }} />
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
