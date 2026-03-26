import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Users, TrendingUp, CheckCircle2, ChevronRight, LayoutDashboard, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    window.location.href = `${API_URL}/api/reports/export`;
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-instrument">Candidate Reports</h1>
          <p className="text-sm text-slate-500">Track company-wide onboarding progress and MCQ scores in one place.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7E22CE, #C084FC)' }}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Users className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Total Candidates</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Avg Overall Progress</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {reports.length > 0 ? Math.round(reports.reduce((a, b) => a + b.overallProgress, 0) / reports.length) : 0}%
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Avg MCQ Score</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
             {reports.length > 0 ? Math.round(reports.reduce((a, b) => a + b.overallScore, 0) / reports.length) : 0}%
          </p>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search candidate..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-6 font-semibold">Candidate</th>
                <th className="py-3 px-6 font-semibold">Department</th>
                <th className="py-3 px-6 font-semibold text-center">Modules Progress</th>
                <th className="py-3 px-6 font-semibold text-center">Aggregated Score</th>
              </tr>
            </thead>
            {loading ? (
               <tbody className="divide-y divide-slate-100 bg-white">
                 <tr><td colSpan={4} className="py-10 text-center text-slate-500 font-medium">Loading reports data...</td></tr>
               </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredReports.map((r, i) => (
                  <tr key={r.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #7E22CE, #C084FC)' }}>
                          {r.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-slate-200">{r.department}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="flex flex-col items-center justify-center gap-1">
                          <span className="text-sm font-bold text-slate-800">{r.overallProgress}%</span>
                          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${r.overallProgress}%`, background: r.overallProgress === 100 ? '#10B981' : '#7E22CE' }} />
                          </div>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <span className="inline-flex items-center gap-1 text-sm font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                         {r.overallScore}%
                       </span>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-500 font-medium italic">No candidates found.</td></tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </motion.div>
    </div>
  );
}
