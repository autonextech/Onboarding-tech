import { useState, useEffect } from 'react';

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
      const [usersRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/users`).then(r => r.json()),
        fetch(`${API_URL}/api/analytics/dashboard`).then(r => r.json())
      ]);

      const allCandidates = usersRes.filter((u: any) => u.role === 'CANDIDATE');
      const activeCandidates = allCandidates.filter((u: any) => u.isActive);
      const inactiveCandidates = allCandidates.filter((u: any) => !u.isActive);

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

  if (loading) return <div className="p-10 text-center text-slate-500 font-body">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 font-body">Organization Overview</span>
            <h1 className="text-4xl font-extrabold tracking-tight headline-font text-primary mt-1">Analytics Intelligence</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="px-5 py-2.5 rounded-md bg-white text-primary font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-outline-variant/20 cursor-pointer font-body">
              <span className="material-symbols-outlined text-sm">download</span> Export Report
            </button>
          </div>
        </div>

        {/* Bento Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Total Candidates</span>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold headline-font text-primary">{metrics.totalCandidates}</span>
              <span className="text-lg font-medium text-slate-500 mb-1 font-body">Users</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold font-body">
              <span className="material-symbols-outlined text-xs">check_circle</span> {metrics.activeCandidates} Active
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/20 rounded-bl-full transition-all group-hover:scale-110"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Global Progress</span>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold headline-font text-primary">{metrics.avgProgress}</span>
              <span className="text-lg font-medium text-slate-500 mb-1 font-body">%</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold font-body">
              <span className="material-symbols-outlined text-xs">trending_up</span> Cohort Average
            </div>
          </div>
          <div className="bg-primary p-8 rounded-xl shadow-xl relative overflow-hidden group transition-all hover:translate-y-[-4px] text-white flex flex-col justify-between">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full transition-all group-hover:scale-110"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 font-body">System Health</span>
              <h3 className="text-xl font-bold headline-font mt-2">Executive Alignment</h3>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold font-body">Target Achievement</span>
                <span className="text-xs font-bold font-body">94%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary-fixed-dim h-full w-[94%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="p-8 border-b border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-bold headline-font text-primary">Recent Candidate Activity</h3>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input className="bg-surface-container pl-10 pr-4 py-2 rounded-md border-none focus:ring-2 focus:ring-primary text-sm w-full font-body" placeholder="Search executives..." type="text"/>
              </div>
              <button className="p-2 bg-surface-container rounded-md hover:bg-surface-container-high transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-slate-500">filter_list</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-slate-500 uppercase text-[10px] font-bold tracking-widest font-body">
                  <th className="px-8 py-4">Executive Name</th>
                  <th className="px-8 py-4">Department</th>
                  <th className="px-8 py-4">Progress Target</th>
                  <th className="px-8 py-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {candidates.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic font-body">No candidates active in this cohort.</td></tr>
                ) : candidates.map((c: any) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary font-body">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-body">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-medium font-body">{c.department || 'Executive Track'}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-surface-container">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 font-body">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {c.status === 'completed' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full font-body">Certified</span>
                      ) : c.status === 'active' ? (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full font-body">On Track</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full font-body">At Risk</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
