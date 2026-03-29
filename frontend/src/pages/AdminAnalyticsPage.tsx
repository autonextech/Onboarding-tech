import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Clock, Target, Download } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/export`);
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autonex_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/full`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(json => {
         if (json.kpis) {
           json.kpis[0].icon = Trophy;
           json.kpis[0].color = '#F59E0B'; json.kpis[0].bg = '#fffbeb';
           json.kpis[1].icon = Target;
           json.kpis[1].color = '#10B981'; json.kpis[1].bg = '#ecfdf5';
           json.kpis[2].icon = Clock;
           json.kpis[2].color = '#3B82F6'; json.kpis[2].bg = '#eff6ff';
         }
         setData(json);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError(err.message || 'Failed to load analytics data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading analytics...</div>;
  if (error || !data) return (
    <div className="p-10 text-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <p className="font-bold text-red-700 mb-1">Failed to load analytics</p>
        <p className="text-xs text-red-500 font-mono">{error || 'No data returned from server'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">Retry</button>
      </div>
    </div>
  );

  const { kpis, weeklyData, distribution } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Platform Analytics</h2>
          <p className="text-sm text-slate-500">Track onboarding performance and engagement metrics.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
          <Download className="h-4 w-4" /> {exporting ? 'Exporting...' : 'Export Report'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi: any, idx: number) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-surface-container-lowest p-5 sm:p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0" style={{ background: kpi.bg, color: kpi.color }}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-slate-900">{kpi.value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">{kpi.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container min-w-0 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Weekly Completions</h3>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="completion" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4, fill: '#1E40AF', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container min-w-0 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 mb-2 sm:mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Progress Distribution</h3>
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={window.innerWidth < 640 ? 40 : 60} outerRadius={window.innerWidth < 640 ? 80 : 100} paddingAngle={5} dataKey="value">
                  {distribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
            {distribution.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 whitespace-nowrap">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
