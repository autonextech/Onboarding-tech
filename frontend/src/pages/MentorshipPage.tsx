import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Users, Mail, Calendar, Star, Video } from 'lucide-react';

const avatarGradients = [
  'linear-gradient(135deg, #1E40AF, #0EA5E9)', 'linear-gradient(135deg, #0EA5E9, #3B82F6)',
  'linear-gradient(135deg, #3B82F6, #6366f1)', 'linear-gradient(135deg, #1E3A8A, #1E40AF)',
  'linear-gradient(135deg, #0EA5E9, #1E40AF)', 'linear-gradient(135deg, #1E40AF, #3B82F6)',
  'linear-gradient(135deg, #3B82F6, #0EA5E9)', 'linear-gradient(135deg, #1E3A8A, #0EA5E9)',
];

export default function MentorshipPage() {
  const { mentors, team } = useStore();

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Mentorship & Team</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Your assigned mentors and team directory</p>
          </div>
        </div>
      </motion.div>

      <h3 className="text-lg font-bold mb-4" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Your Mentors</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {mentors.map((mentor, idx) => (
          <motion.div key={mentor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <div className="glass-card p-5 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full text-white text-lg font-bold flex-shrink-0"
                  style={{ background: avatarGradients[idx] }}>
                  {mentor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold" style={{ color: '#0F172A' }}>{mentor.name}</h4>
                  <p className="text-sm" style={{ color: '#64748B' }}>{mentor.role} · {mentor.department}</p>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {mentor.expertise.map(e => (
                      <span key={e} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#eff6ff', color: '#1E40AF' }}>{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: '#64748B' }}>{mentor.bio}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <div className="flex items-center gap-4 text-xs" style={{ color: '#64748B' }}>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} /> {mentor.meetingsCompleted} meetings</span>
                  {mentor.nextMeeting && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" style={{ color: '#1E40AF' }} /> {mentor.nextMeeting}</span>}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer" style={{ background: '#eff6ff', color: '#1E40AF' }}>
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer" style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                    <Video className="h-3.5 w-3.5" /> Schedule
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-4" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Meet the Team</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {team.map((member, idx) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.05 }}>
            <div className="glass-card p-4 sm:p-5 text-center">
              <div className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white font-bold text-sm mb-3"
                style={{ background: avatarGradients[idx % avatarGradients.length] }}>
                {member.avatar}
              </div>
              <h4 className="text-sm font-bold" style={{ color: '#0F172A' }}>{member.name}</h4>
              <p className="text-xs" style={{ color: '#64748B' }}>{member.role}</p>
              <p className="text-xs mt-1 px-2 py-0.5 inline-block rounded-full" style={{ background: '#f1f5f9', color: '#64748B' }}>{member.department}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
