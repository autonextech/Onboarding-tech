import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckSquare, Clock, FileText, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TasksPage() {
  const { userId } = useStore();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/candidates/${userId}/dashboard`)
      .then(r => r.json())
      .then(data => setModules(data.modules || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  // Derive tasks from modules — quizzes and assessments are the real "tasks"
  const tasks = modules.flatMap((m: any) => {
    const items: any[] = [];
    if (m.quizScore !== undefined && m.quizScore !== null) {
      items.push({ id: `quiz-${m.id}`, title: `${m.title} — Quiz`, type: 'quiz', status: m.quizScore > 0 ? 'completed' : 'pending', score: m.quizScore, module: m.title });
    }
    if (m.assessmentUrl) {
      items.push({ id: `assess-${m.id}`, title: `${m.title} — Assessment`, type: 'assessment', url: m.assessmentUrl, status: 'pending', module: m.title });
    }
    return items;
  });

  if (loading) return <div className="p-10 text-center text-slate-500">Loading tasks...</div>;

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Tasks & Assessments</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Quizzes and external assessments from your modules</p>
          </div>
        </div>
      </motion.div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-slate-500 italic">
          No tasks yet. Complete your module content to unlock quizzes and assessments.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: any, idx: number) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <div className="glass-card p-4 sm:p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: task.status === 'completed' ? '#ecfdf5' : '#faf5ff', color: task.status === 'completed' ? '#10B981' : '#7E22CE' }}>
                  {task.type === 'quiz' ? <FileText className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold" style={{ color: '#0F172A' }}>{task.title}</h3>
                  <p className="text-xs" style={{ color: '#64748B' }}>{task.module}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.type === 'quiz' && task.score > 0 && (
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>{task.score}%</span>
                  )}
                  {task.type === 'assessment' && task.url && (
                    <a href={task.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
                      Take Test
                    </a>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${task.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {task.status === 'completed' ? '✓ Done' : <><Clock className="inline h-3 w-3 mr-1" />Pending</>}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
