import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Skeleton pulse component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className || ''}`} />
);

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Single API call instead of N+1
    fetch(`${API_URL}/api/admin/dashboard`)
      .then(r => r.json())
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.candidates) setCandidates(data.candidates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autonex_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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

      {/* Metrics - show skeleton while loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : (
          <>
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Total Candidates</span>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold headline-font text-primary">{metrics.totalCandidates}</span>
                <span className="text-lg font-medium text-slate-500 mb-1 font-body">Users</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold font-body">
                <span className="material-symbols-outlined text-xs">check_circle</span> {metrics.activeCandidates} Active · {metrics.inactiveCandidates} Inactive
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/20 rounded-bl-full transition-all group-hover:scale-110" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Global Progress</span>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold headline-font text-primary">{metrics.avgProgress}</span>
                <span className="text-lg font-medium text-slate-500 mb-1 font-body">%</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold font-body">
                <span className="material-symbols-outlined text-xs">trending_up</span> {metrics.completedCandidates} Completed · {metrics.totalModules} Modules
              </div>
            </div>

            <div className="bg-primary p-8 rounded-xl shadow-xl relative overflow-hidden group transition-all hover:translate-y-[-4px] text-white flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full transition-all group-hover:scale-110" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 font-body">System Health</span>
                <h3 className="text-xl font-bold headline-font mt-2">Executive Alignment</h3>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold font-body">Target Achievement</span>
                  <span className="text-xs font-bold font-body">{metrics.avgProgress}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary-fixed-dim h-full rounded-full transition-all duration-700" style={{ width: `${metrics.avgProgress}%` }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Candidate Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="p-8 border-b border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-bold headline-font text-primary">Recent Candidate Activity</h3>
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-surface-container pl-10 pr-4 py-2 rounded-md border-none focus:ring-2 focus:ring-primary text-sm w-full font-body outline-none"
              placeholder="Search candidates..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-slate-500 uppercase text-[10px] font-bold tracking-widest font-body">
                <th className="px-4 sm:px-8 py-4 whitespace-nowrap">Candidate Name</th>
                <th className="px-4 sm:px-8 py-4 hidden md:table-cell">Department</th>
                <th className="px-4 sm:px-8 py-4 hidden md:table-cell">Mentor</th>
                <th className="px-4 sm:px-8 py-4 whitespace-nowrap">Progress</th>
                <th className="px-4 sm:px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 sm:px-8 py-5"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 sm:px-8 py-5 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 sm:px-8 py-5 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 sm:px-8 py-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 sm:px-8 py-5"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic font-body">No candidates found.</td></tr>
              ) : filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary font-body">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-body">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-5 text-sm text-slate-600 font-medium font-body hidden md:table-cell">{c.department || '—'}</td>
                  <td className="px-4 sm:px-8 py-5 text-sm text-slate-600 font-body hidden md:table-cell">{c.mentorName}</td>
                  <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-16 sm:w-20 h-1.5 rounded-full overflow-hidden bg-surface-container shrink-0">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 font-body">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-5">
                    {c.status === 'completed' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full font-body">Certified</span>
                    ) : c.status === 'active' ? (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full font-body">On Track</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full font-body">Inactive</span>
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
