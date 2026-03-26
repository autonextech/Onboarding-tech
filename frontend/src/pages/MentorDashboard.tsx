import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MentorDashboard() {
  const { userName, userId, userRole } = useStore();
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || userRole !== 'mentor') return;
    
    fetch(`${API_URL}/api/mentors/${userId}/mentees`)
      .then(res => res.json())
      .then(data => setMentees(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, userRole]);

  if (loading) return <div className="p-12 text-center text-slate-500 font-body">Loading your Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 font-body">Mentor Portal</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight headline-font text-primary mt-2 leading-[1.1]">
            Welcome back, <br className="hidden md:block"/>
            <span className="text-cyan-600">{userName.split(' ')[0]}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-surface-container-lowest p-4 px-6 rounded-xl border border-surface-container shadow-sm">
          <span className="material-symbols-outlined text-3xl text-cyan-600/40">group</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Assigned Mentees</p>
            <p className="text-xl font-bold text-on-surface font-body">{mentees.length}</p>
          </div>
        </div>
      </div>

      {/* Mentees List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] overflow-hidden mt-8">
        <div className="p-8 border-b border-surface-container flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold headline-font text-primary">Your Assigned Mentees</h3>
        </div>
        
        <div className="p-0">
          {mentees.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center border border-dashed border-slate-200 m-8 rounded-xl bg-slate-50/30">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">person_off</span>
              <p className="font-bold text-slate-500 text-lg">No Mentees Assigned</p>
              <p className="text-sm text-slate-400 mt-1">When an administrator assigns candidates to you, their progress will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-4 px-8">Candidate</th>
                    <th className="py-4 px-6 text-center">Modules Completed</th>
                    <th className="py-4 px-6 text-center">Avg Quiz Score</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {mentees.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm">
                            {m.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{m.email}</p>
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{m.department || 'No Dept'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-800 text-lg">{m.completedModulesCount}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Completed</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100 text-sm">{m.quizScorePercent}%</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${m.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
