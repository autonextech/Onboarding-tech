import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ModulesPage() {
  const { userId } = useStore();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/candidates/${userId}/dashboard?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading modules...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: '#1d3989' }}>
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Learning Modules</h2>
            <p className="text-sm" style={{ color: '#4d5d85' }}>Your structured learning path</p>
          </div>
        </div>
      </motion.div>

      {modules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-slate-500 italic">No modules published yet. Contact your administrator.</div>
      ) : (
        <div className="space-y-4">
          {modules.map((m: any, idx: number) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/module/${m.id}`)}>
                <div className="p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: m.progress === 100 ? '#ecfdf5' : 'rgba(59, 130, 246, 0.05)', color: m.progress === 100 ? '#10B981' : '#1d3989' }}>
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: '#00113f' }}>{m.title}</h3>
                      {m.progress === 100 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#10B981' }}>✓ Done</span>
                      )}
                    </div>
                    <p className="text-sm hidden sm:block" style={{ color: '#4d5d85' }}>{m.description}</p>
                    <div className="mt-2 flex items-center gap-3 sm:gap-4">
                      <span className="text-xs" style={{ color: '#4d5d85' }}>{m.completedLessons || 0}/{m.totalLessons || 0} sections</span>
                      <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.progress || 0}%`, background: m.progress === 100 ? '#10B981' : '#1d3989' }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: m.progress === 100 ? '#10B981' : '#1d3989' }}>{m.progress || 0}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 hidden sm:block" style={{ color: '#94a3b8' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
