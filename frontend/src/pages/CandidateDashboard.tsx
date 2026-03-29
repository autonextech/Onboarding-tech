import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MentorDashboard from './MentorDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CandidateDashboard() {
  const { userName, userId, userRole } = useStore();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overallProgress: 0,
    completedModules: 0,
    totalModules: 0,
    avgQuizScore: 0,
    mentorName: 'Unassigned'
  });
  
  useEffect(() => {
    if (!userId || userRole === 'mentor') {
      setLoading(false);
      return;
    }
    
    fetch(`${API_URL}/api/candidates/${userId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        const realModules = data.modules.map((m: any) => ({
          ...m,
          lessons: m.sections || []
        }));
        
        setModules(realModules);
        setStats(data.stats || {
          overallProgress: 0,
          completedModules: 0,
          totalModules: 0,
          avgQuizScore: 0,
          mentorName: 'Unassigned'
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, userRole]);

  if (userRole === 'mentor') {
    return <MentorDashboard />;
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-body">Loading your Executive Profile...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 font-body">Onboarding Phase 1</span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight headline-font text-primary mt-2 leading-[1.1]">
              Welcome back, <br className="hidden md:block"/>
              <span className="text-primary">{userName.split(' ')[0]}</span>
            </h1>
          </div>
          
          <div className="flex items-center justify-between md:justify-start gap-4 bg-surface-container-lowest p-4 px-6 rounded-xl border border-surface-container shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-primary/40 shrink-0">military_tech</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Primary Advisor</p>
                <p className="text-sm font-bold text-on-surface font-body break-words">{stats.mentorName}</p>
              </div>
            </div>
            <button onClick={() => navigate('/mentorship')} className="md:ml-4 h-8 w-8 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary/10 transition-colors cursor-pointer material-symbols-outlined text-sm">
              arrow_forward
            </button>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-primary p-8 rounded-xl shadow-xl relative overflow-hidden group transition-all hover:translate-y-[-4px] text-white flex flex-col justify-between">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full transition-all group-hover:scale-110"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 font-body">Progression</span>
              <h3 className="text-xl font-bold headline-font mt-2">Overall Alignment</h3>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold font-body">Milestone Target</span>
                <span className="text-xs font-bold font-body">{stats.overallProgress}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary-fixed-dim h-full" style={{ width: `${stats.overallProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/10 rounded-bl-full transition-all group-hover:scale-110"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Module Completion</span>
            <div className="mt-4 flex items-end gap-2 text-on-surface">
              <span className="text-5xl font-bold headline-font">{stats.completedModules}</span>
              <span className="text-2xl font-light text-outline mb-1">/</span>
              <span className="text-xl font-bold text-outline mb-1 h-fit">{stats.totalModules}</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-slate-500 text-xs font-bold font-body">
              <span className="material-symbols-outlined text-xs">layers</span> Required architectural frameworks
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] relative overflow-hidden group transition-all hover:translate-y-[-4px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/20 rounded-bl-full transition-all group-hover:scale-110"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-body">Certification Average</span>
            <div className="mt-4 flex items-end gap-2 text-on-surface">
              <span className="text-5xl font-bold headline-font">{stats.avgQuizScore}</span>
              <span className="text-lg font-medium text-slate-500 mb-1 font-body">%</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold font-body">
              <span className="material-symbols-outlined text-xs text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified Competency
            </div>
          </div>
          
        </div>

        {/* Modules List */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] overflow-hidden mt-8">
          <div className="p-8 border-b border-surface-container flex justify-between items-center">
            <h3 className="text-xl font-bold headline-font text-primary">Your Learning Path</h3>
            <button onClick={() => navigate('/modules')} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors font-body cursor-pointer">
              View All Modules
            </button>
          </div>
          
          <div className="p-0">
            {modules.length === 0 ? (
              <div className="p-10 text-center text-slate-500 italic font-body">Waiting for executive assignment...</div>
            ) : (
              <ul className="divide-y divide-surface-container">
                {modules.map((m: any, idx: number) => {
                  const isCompleted = m.progress === 100;
                  const isStarted = m.progress > 0 && m.progress < 100;
                  
                  return (
                    <li key={m.id} className="p-6 md:px-8 hover:bg-surface-container-low transition-colors group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        <div className="flex items-center gap-5 flex-1">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${isCompleted ? 'bg-primary border-primary text-white' : isStarted ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-surface-container border-surface-container-highest text-slate-400'}`}>
                            <span className="material-symbols-outlined" style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}>
                              {isCompleted ? 'check_circle' : 'import_contacts'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1 font-body">Phase 1 / Module {idx + 1}</p>
                            <h4 className="text-lg font-bold text-primary font-body group-hover:text-primary transition-colors">{m.title}</h4>
                            <p className="text-sm text-slate-500 line-clamp-1 font-body mt-0.5 max-w-2xl">{m.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 md:w-1/3 justify-end">
                          <div className="hidden md:flex flex-col items-end gap-1 flex-1">
                            <div className="flex justify-between w-full max-w-[120px]">
                              <span className="text-xs font-bold text-outline uppercase">Progress</span>
                              <span className="text-xs font-bold text-primary">{m.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full max-w-[120px] bg-surface-container rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${m.progress}%` }}></div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => navigate(`/module/${m.id}`)}
                            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer font-body flex items-center gap-2 whitespace-nowrap shrink-0 ${
                              isCompleted 
                                ? 'bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container-low' 
                                : 'bg-gradient-to-br from-primary to-primary-container text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }`}
                          >
                            <span>{isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'}</span>
                            <span className="material-symbols-outlined text-sm">{isCompleted ? 'arrow_forward' : 'play_arrow'}</span>
                          </button>
                        </div>
                        
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
  );
}
