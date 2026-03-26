import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { BookOpen, PlayCircle, FileText, AlignLeft, CheckCircle2, Lock, ChevronRight, Building, Shield, Code, Users } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, typeof Building> = { building: Building, shield: Shield, code: Code, users: Users };

export default function ModulesPage() {
  const { modules, completeLesson } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const typeIcon = (type: string) => {
    if (type === 'video') return <PlayCircle className="h-4 w-4" />;
    if (type === 'document') return <FileText className="h-4 w-4" />;
    return <AlignLeft className="h-4 w-4" />;
  };

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Learning Modules</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Your structured learning path with progressive unlocking</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {modules.map((m, idx) => {
          const Icon = iconMap[m.icon] || BookOpen;
          const isLocked = m.status === 'locked';
          const isCompleted = m.status === 'completed';
          const isExpanded = expandedId === m.id;

          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <div className={`glass-card overflow-hidden ${isLocked ? 'opacity-60 grayscale-[40%]' : ''}`}>
                <div className="p-4 sm:p-6 flex items-center gap-4 sm:gap-5 cursor-pointer" onClick={() => !isLocked && setExpandedId(isExpanded ? null : m.id)}>
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: isLocked ? '#e2e8f0' : isCompleted ? '#ecfdf5' : '#eff6ff', color: isLocked ? '#94a3b8' : isCompleted ? '#10B981' : '#1E40AF' }}>
                    {isLocked ? <Lock className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: '#0F172A' }}>{m.title}</h3>
                      {isCompleted && (
                        <span className="flex items-center text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#10B981' }}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                        </span>
                      )}
                    </div>
                    <p className="text-sm hidden sm:block" style={{ color: '#64748B' }}>{m.description}</p>
                    <div className="mt-2 flex items-center gap-3 sm:gap-4">
                      <span className="text-xs" style={{ color: '#64748B' }}>{m.completedLessons}/{m.totalLessons} lessons</span>
                      <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.progress}%`, background: isCompleted ? '#10B981' : '#1E40AF' }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: isCompleted ? '#10B981' : '#1E40AF' }}>{m.progress}%</span>
                    </div>
                  </div>
                  {!isLocked && <ChevronRight className={`h-5 w-5 transition-transform duration-200 hidden sm:block ${isExpanded ? 'rotate-90' : ''}`} style={{ color: '#94a3b8' }} />}
                </div>

                {isExpanded && !isLocked && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-slate-100">
                    <div className="p-3 sm:p-4 space-y-1">
                      {m.lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg flex-shrink-0`}
                            style={{ background: lesson.completed ? '#ecfdf5' : '#f1f5f9', color: lesson.completed ? '#10B981' : '#94a3b8' }}>
                            {lesson.completed ? <CheckCircle2 className="h-4 w-4" /> : typeIcon(lesson.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${lesson.completed ? 'line-through' : ''}`} style={{ color: lesson.completed ? '#94a3b8' : '#0F172A' }}>{lesson.title}</p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>{lesson.type} · {lesson.duration}</p>
                          </div>
                          {!lesson.completed && (
                            <button onClick={(e) => { e.stopPropagation(); completeLesson(m.id, lesson.id); }}
                              className="opacity-0 group-hover:opacity-100 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all cursor-pointer"
                              style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                              Mark Done
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
