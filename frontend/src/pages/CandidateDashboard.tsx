import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import ModuleCard from '../components/ui/ModuleCard';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

export default function CandidateDashboard() {
  const { userName, userId, overallProgress } = useStore();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) return;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/candidates/${userId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        // Adapt real DB modules to the visual ModuleCard format
        const realModules = data.modules.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: 'locked', // Without an active progress table yet, all are initially shown
          progress: 0,
          totalLessons: m.sections?.length || 0,
          completedLessons: 0,
          icon: 'book-open',
          lessons: m.sections?.map((s: any) => ({
            id: s.id,
            title: s.title,
            type: s.videoUrl ? 'video' : (s.documents?.length > 0 ? 'document' : 'text'),
            duration: `${s.videoDuration || 10} min`,
            completed: false
          })) || []
        }));
        
        // Unlock the very first module automatically for demo
        if (realModules.length > 0) {
          realModules[0].status = 'in_progress';
        }
        
        setModules(realModules);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const stats = [
    { label: 'Modules Ready', value: modules.length, icon: Award, color: '#10B981', bg: '#ecfdf5' },
    { label: 'Tasks Pending', value: '3', icon: Clock, color: '#F59E0B', bg: '#fffbeb' },
    { label: 'Quiz Score Avg', value: '0%', icon: TrendingUp, color: '#1E40AF', bg: '#eff6ff' },
    { label: 'Mentor Sessions', value: '0', icon: Users, color: '#0EA5E9', bg: '#f0f9ff' },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your profile...</div>;

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-card mb-6 sm:mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: 'linear-gradient(to bottom, #1E40AF, #0EA5E9)' }} />
        <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>
              Welcome aboard, <span className="gradient-text">{userName.split(' ')[0]}</span>!
            </h2>
            <p className="mt-2 text-base sm:text-lg" style={{ color: '#64748B' }}>
              Complete your onboarding modules to get up to speed with our tools, culture, and processes.
            </p>
          </div>
          {/* Progress Ring */}
          <div className="flex flex-col items-center bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-100 flex-shrink-0">
            <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24">
              <svg className="w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle stroke="#e2e8f0" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle stroke="#1E40AF" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * overallProgress) / 100}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold" style={{ color: '#0F172A' }}>{overallProgress}%</span>
              </div>
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium" style={{ color: '#64748B' }}>Overall Progress</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl flex-shrink-0" style={{ background: stat.bg, color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold" style={{ color: '#0F172A' }}>{stat.value}</p>
                <p className="text-xs font-medium truncate" style={{ color: '#64748B' }}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Modules Grid */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Your Learning Path</h3>
        {modules.length === 0 ? (
          <div className="text-center py-10 bg-white border rounded-xl text-slate-500 italic">No modules published yet. Please ask your administrator.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <motion.div key={module.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + index * 0.1 }}>
                <ModuleCard module={module} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
