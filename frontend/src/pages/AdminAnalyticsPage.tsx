import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Clock, Target, Download } from 'lucide-react';

const mockWeeklyData = [
  { name: 'Mon', completion: 4 },
  { name: 'Tue', completion: 7 },
  { name: 'Wed', completion: 5 },
  { name: 'Thu', completion: 11 },
  { name: 'Fri', completion: 8 },
  { name: 'Sat', completion: 2 },
  { name: 'Sun', completion: 3 },
];

const mockDistribution = [
  { name: '0-25%', value: 12 },
  { name: '26-50%', value: 8 },
  { name: '51-75%', value: 15 },
  { name: '76-100%', value: 25 },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, we'd fetch analytics data from /api/analytics
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const kpis = [
    { label: 'Avg Quiz Score', value: '84%', icon: Trophy, color: '#F59E0B', bg: '#fffbeb', trend: '+2.4%' },
    { label: 'Completion Rate', value: '68%', icon: Target, color: '#10B981', bg: '#ecfdf5', trend: '+5.1%' },
    { label: 'Avg Time to Complete', value: '14 Days', icon: Clock, color: '#3B82F6', bg: '#eff6ff', trend: '-1.2 Days' },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading analytics...</div>;

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Platform Analytics</h2>
          <p className="text-sm text-slate-500">Track onboarding performance and engagement metrics.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
          <Download className="h-4 w-4" /> Export Report
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="glass-card p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Weekly Completions</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="completion" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4, fill: '#1E40AF', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Progress Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {mockDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {mockDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-semibold text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
