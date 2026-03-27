import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Users, Mail, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MentorshipPage() {
  const { userId } = useStore();
  const [mentor, setMentor] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    // Fetch dashboard for mentor info
    fetch(`${API_URL}/api/candidates/${userId}/dashboard`)
      .then(r => r.json())
      .then(dashboardData => {
        if (dashboardData.stats?.mentorName && dashboardData.stats.mentorName !== 'Unassigned') {
          setMentor({ name: dashboardData.stats.mentorName });
        }
      })
      .catch(console.error);

    // Fetch global company team directory
    fetch(`${API_URL}/api/team`)
      .then(r => r.json())
      .then(teamData => {
        setTeam(Array.isArray(teamData) ? teamData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading mentorship info...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: '#1d3989' }}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Mentorship & Team</h2>
            <p className="text-sm" style={{ color: '#4d5d85' }}>Your assigned mentor and team members</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mentor Section */}
        {mentor ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-6 sm:p-8 h-full">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d5d85] mb-4">Primary Advisor</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shrink-0"
                  style={{ background: '#1d3989' }}>
                  {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#00113f' }}>{mentor.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex mt-1" style={{ background: 'rgba(59, 130, 246, 0.05)', color: '#1d3989' }}>
                    <Award className="inline h-3 w-3 mr-1" />Mentor
                  </span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-4 text-sm text-primary border border-primary/20">
                <p className="font-semibold mb-1">Your mentor has been assigned by your administrator.</p>
                <p className="text-xs opacity-90">Reach out for guidance on modules, or any onboarding-related questions.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-8 text-center h-full flex flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: '#f1f5f9' }}>
              <Mail className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Mentor Assigned Yet</h3>
            <p className="text-sm text-slate-500">Your administrator will assign a mentor soon.</p>
          </div>
        )}

        {/* Team Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 mt-4">
          <div className="mb-6 border-b border-surface-container pb-4">
            <h3 className="text-2xl font-bold" style={{ color: '#00113f' }}>Meet the Team</h3>
            <p className="text-sm mt-1" style={{ color: '#4d5d85' }}>Get to know your colleagues.</p>
          </div>
          
          {team.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
              <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No company directory members listed yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(
                team.reduce((acc: any, member: any) => {
                  if (!acc[member.department]) acc[member.department] = [];
                  acc[member.department].push(member);
                  return acc;
                }, {})
              ).map(([department, members]: [string, any]) => (
                <div key={department}>
                  <h4 className="text-lg font-bold mb-4 pb-2 border-b-2 inline-block border-blue-100" style={{ color: '#1d3989' }}>
                    {department}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {members.map((member: any) => (
                      <div key={member.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 p-5 flex flex-col items-center text-center group">
                        <div className="h-16 w-16 mb-4 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-indigo-500 to-blue-600 shadow-inner group-hover:scale-105 transition-transform">
                          {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <h5 className="font-bold text-slate-900 leading-tight mb-1">{member.name}</h5>
                        <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 mb-4 h-8 flex items-center justify-center text-center">{member.role}</p>
                        
                        <div className="w-full space-y-2 mt-auto">
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="text-[11px] text-slate-500 hover:text-blue-600 transition-colors block truncate w-full mb-3">
                              {member.email}
                            </a>
                          )}
                          <div className="flex gap-2 justify-center pt-3 border-t border-slate-100">
                            {member.linkedin ? (
                              <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-md transition-colors text-xs font-medium">
                                LinkedIn
                              </a>
                            ) : (
                              <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 text-slate-400 rounded-md text-xs font-medium">LinkedIn</span>
                            )}
                            {member.slack ? (
                              <a href={member.slack} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#4A154B]/10 text-[#4A154B] hover:bg-[#4A154B]/20 rounded-md transition-colors text-xs font-medium">
                                Slack
                              </a>
                            ) : (
                              <span className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 text-slate-400 rounded-md text-xs font-medium">Slack</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
