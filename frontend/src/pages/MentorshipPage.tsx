import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Users, Mail, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MentorshipPage() {
  const { userId } = useStore();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/candidates/${userId}/dashboard`)
      .then(r => r.json())
      .then(data => {
        if (data.stats?.mentorName && data.stats.mentorName !== 'Unassigned') {
          setMentor({ name: data.stats.mentorName });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading mentorship info...</div>;

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#0F172A', fontFamily: "'Instrument Sans', sans-serif" }}>Mentorship</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Your assigned mentor and guidance</p>
          </div>
        </div>
      </motion.div>

      {mentor ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card p-6 sm:p-8 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
                {mentor.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>{mentor.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#faf5ff', color: '#7E22CE' }}>
                  <Award className="inline h-3 w-3 mr-1" />Mentor
                </span>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-800">
              <p className="font-medium mb-1">Your mentor has been assigned by your administrator.</p>
              <p className="text-xs text-purple-600">Reach out to your mentor for guidance on modules, tasks, or any onboarding-related questions.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: '#f1f5f9' }}>
            <Mail className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Mentor Assigned Yet</h3>
          <p className="text-sm text-slate-500">Your administrator will assign a mentor to guide your onboarding journey.</p>
        </div>
      )}
    </div>
  );
}
