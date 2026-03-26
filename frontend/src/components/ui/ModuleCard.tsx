import { Lock, PlayCircle, CheckCircle2, ChevronRight, Building, Shield, Code, Users } from 'lucide-react';
import type { Module } from '../../store/useStore';

const iconMap: Record<string, typeof Building> = { building: Building, shield: Shield, code: Code, users: Users };

export default function ModuleCard({ module }: { module: Module }) {
  const isLocked = module.status === 'locked';
  const isCompleted = module.status === 'completed';
  const Icon = iconMap[module.icon] || PlayCircle;

  return (
    <div className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
      isLocked ? 'bg-slate-50/50 border-slate-200 opacity-60 grayscale-[40%]' : isCompleted ? 'glass-card border-green-100' : 'glass-card'
    }`} style={isLocked ? {} : { cursor: 'pointer' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl"
          style={{ background: isLocked ? '#e2e8f0' : isCompleted ? '#ecfdf5' : '#eff6ff', color: isLocked ? '#94a3b8' : isCompleted ? '#10B981' : '#1E40AF' }}>
          {isLocked ? <Lock className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
        </div>
        {isCompleted && (
          <span className="flex items-center text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#10B981' }}>
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </span>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-base sm:text-lg font-bold mb-1.5" style={{ color: '#0F172A' }}>{module.title}</h4>
        <p className="text-sm line-clamp-2" style={{ color: '#64748B' }}>{module.description}</p>
      </div>
      <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100">
        {!isLocked ? (
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span style={{ color: '#64748B' }}>{module.completedLessons} / {module.totalLessons} Lessons</span>
              <span style={{ color: isCompleted ? '#10B981' : '#1E40AF' }}>{module.progress}%</span>
            </div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#e2e8f0' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${module.progress}%`, background: isCompleted ? '#10B981' : 'linear-gradient(90deg, #1E40AF, #0EA5E9)' }} />
            </div>
            {!isCompleted && (
              <button className="mt-4 w-full flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer" style={{ color: '#1E40AF' }}>
                Continue Learning <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center text-sm font-medium" style={{ color: '#94a3b8' }}>
            <Lock className="w-4 h-4 mr-1.5" /> Requires prerequisites
          </div>
        )}
      </div>
    </div>
  );
}
