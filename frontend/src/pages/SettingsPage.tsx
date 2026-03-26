import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { userName, userEmail, userRole } = useStore();

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #1E3A8A, #1E40AF)' }}>
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Settings</h2>
            <p className="text-sm" style={{ color: '#4d5d85' }}>Manage your account preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <User className="h-5 w-5" style={{ color: '#1E40AF' }} />
              <h3 className="text-lg font-bold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4d5d85' }}>Full Name</label>
                <input type="text" defaultValue={userName} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ color: '#00113f' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4d5d85' }}>Email</label>
                <input type="email" defaultValue={userEmail} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ color: '#00113f' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4d5d85' }}>Role</label>
                <input type="text" value={userRole === 'admin' ? 'Administrator' : 'Candidate'} readOnly className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50" style={{ color: '#4d5d85' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#4d5d85' }}>Department</label>
                <input type="text" defaultValue="Engineering" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ color: '#00113f' }} />
              </div>
            </div>
            <button className="mt-4 px-5 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition-shadow hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
              Save Changes
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <Bell className="h-5 w-5" style={{ color: '#1E40AF' }} />
              <h3 className="text-lg font-bold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Notification Preferences</h3>
            </div>
            {['Email notifications for task updates', 'Email notifications for mentor messages', 'Push notifications for quiz deadlines', 'Weekly progress summary email'].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <span className="text-sm" style={{ color: '#00113f' }}>{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" style={{ background: '#e2e8f0' }}></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <Shield className="h-5 w-5" style={{ color: '#1E40AF' }} />
              <h3 className="text-lg font-bold" style={{ color: '#00113f', fontFamily: "'Outfit', sans-serif" }}>Security</h3>
            </div>
            <button className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer" style={{ color: '#00113f' }}>
              Change Password
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
