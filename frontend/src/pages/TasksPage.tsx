import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckSquare, Clock, Upload, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', bg: '#fef3c7', color: '#92400e', icon: Clock },
  in_progress: { label: 'In Progress', bg: '#eff6ff', color: '#1E40AF', icon: Upload },
  submitted: { label: 'Submitted', bg: '#e0e7ff', color: '#3730a3', icon: FileUp },
  graded: { label: 'Graded', bg: '#ecfdf5', color: '#065f46', icon: CheckCircle2 },
};

export default function TasksPage() {
  const { tasks, submitTask } = useStore();

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #F59E0B, #d97706)' }}>
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Task Assignments</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Complete tasks and receive rubric-based feedback</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {tasks.map((task, idx) => {
          const cfg = statusConfig[task.status];
          const StatusIcon = cfg.icon;
          return (
            <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <div className="glass-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: '#0F172A' }}>{task.title}</h3>
                      <span className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon className="w-3 h-3 mr-1" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: '#64748B' }}>{task.description}</p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
                      <span>📚 {task.module}</span>
                      <span>📅 Due {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {task.status === 'graded' && task.score !== undefined && (
                      <div className="text-center p-3 rounded-xl" style={{ background: '#ecfdf5' }}>
                        <div className="text-2xl font-extrabold" style={{ color: '#10B981' }}>{task.score}</div>
                        <div className="text-xs font-medium" style={{ color: '#065f46' }}>/100</div>
                      </div>
                    )}
                    {(task.status === 'pending' || task.status === 'in_progress') && (
                      <button onClick={() => submitTask(task.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:shadow-lg cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                        <Upload className="h-4 w-4" /> Submit
                      </button>
                    )}
                  </div>
                </div>
                {task.feedback && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                    <p className="text-sm" style={{ color: '#64748B' }}><span className="font-semibold" style={{ color: '#0F172A' }}>Feedback:</span> {task.feedback}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
