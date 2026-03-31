import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Users, TrendingUp, CheckCircle2, Search, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/reports?t=${Date.now()}`, { cache: 'no-store' })
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

  const toggleExpand = (userId: string) => {
    setExpandedRow(expandedRow === userId ? null : userId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-instrument">Candidate Reports</h1>
          <p className="text-sm text-slate-500">Track company-wide onboarding progress and quiz scores in one place.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md cursor-pointer bg-primary hover:bg-primary-container">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Total Candidates</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Avg Overall Progress</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {reports.length > 0 ? Math.round(reports.reduce((a, b) => a + b.overallProgress, 0) / reports.length) : 0}%
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <p className="text-sm font-semibold text-slate-500">Avg Quiz Score</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">
             {reports.length > 0 ? Math.round(reports.reduce((a, b) => a + b.overallScore, 0) / reports.length) : 0}%
          </p>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search candidate..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <p className="text-xs text-slate-400 font-medium">Click a row to see per-module quiz breakdown</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-6 font-semibold w-8"></th>
                <th className="py-3 px-6 font-semibold">Candidate</th>
                <th className="py-3 px-6 font-semibold hidden md:table-cell">Department</th>
                <th className="py-3 px-6 font-semibold text-center">Progress</th>
                <th className="py-3 px-6 font-semibold text-center">Quiz Score</th>
                <th className="py-3 px-6 font-semibold text-center">Marks</th>
              </tr>
            </thead>
            {loading ? (
               <tbody className="divide-y divide-slate-100 bg-white">
                 <tr><td colSpan={6} className="py-10 text-center text-slate-500 font-medium">Loading reports data...</td></tr>
               </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredReports.map((r) => (
                  <>
                    <tr key={r.userId} onClick={() => toggleExpand(r.userId)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                      <td className="py-4 px-4 text-center">
                        {expandedRow === r.userId ? (
                          <ChevronDown className="h-4 w-4 text-primary inline-block" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 inline-block" />
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-primary">
                            {r.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{r.name}</p>
                            <p className="text-xs text-slate-500">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-600 hidden md:table-cell">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-slate-200">{r.department}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                         <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-sm font-bold text-slate-800">{r.overallProgress}%</span>
                            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${r.overallProgress}%`, background: r.overallProgress === 100 ? '#10B981' : '#1d3989' }} />
                            </div>
                         </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                         <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${
                           r.overallScore >= 70 ? 'bg-green-50 text-green-700 border-green-100' :
                           r.overallScore >= 40 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                           'bg-red-50 text-red-600 border-red-100'
                         }`}>
                           {r.overallScore}%
                         </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                          {r.correctAnswers}/{r.totalQuestions}
                        </span>
                        {r.attemptedQuestions > 0 && r.attemptedQuestions < r.totalQuestions && (
                          <p className="text-[11px] text-amber-500 mt-1 font-medium">
                            {r.totalQuestions - r.attemptedQuestions} unattempted
                          </p>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Per-Module Breakdown */}
                    {expandedRow === r.userId && r.moduleStats && r.moduleStats.length > 0 && (
                      <tr key={`${r.userId}-details`}>
                        <td colSpan={6} className="p-0">
                          <AnimatePresence>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-slate-50/70 px-6 sm:px-10 py-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Per-Module Breakdown</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {r.moduleStats.map((ms: any) => (
                                    <div key={ms.moduleId} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                      <p className="text-sm font-bold text-slate-800 truncate mb-2">{ms.moduleTitle}</p>
                                      <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-slate-500">Progress</span>
                                        <span className="font-bold text-slate-700">{ms.progress}%</span>
                                      </div>
                                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#e2e8f0' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${ms.progress}%`, background: ms.progress === 100 ? '#10B981' : '#1d3989' }} />
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Quiz Score</span>
                                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                          ms.score >= 70 ? 'bg-green-50 text-green-700' :
                                          ms.score >= 40 ? 'bg-amber-50 text-amber-700' :
                                          ms.totalQuestions === 0 ? 'bg-slate-50 text-slate-400' :
                                          'bg-red-50 text-red-600'
                                        }`}>
                                          {ms.totalQuestions === 0 ? 'No quiz' : `${ms.score}%`}
                                        </span>
                                      </div>
                                      {ms.totalQuestions > 0 && (
                                        <div className="flex items-center justify-between text-xs mt-1.5">
                                          <span className="text-slate-500">Marks</span>
                                          <span className="font-bold text-slate-700">{ms.correctAnswers}/{ms.totalQuestions}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filteredReports.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-500 font-medium italic">No candidates found.</td></tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </motion.div>
    </div>
  );
}
