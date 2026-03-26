import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Building, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CANDIDATE',
    department: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add user');
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'CANDIDATE', department: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error creating user. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>User Management</h2>
          <p className="text-sm text-slate-500">Manage candidates, mentors, and administrators.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md"
          style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
          <Plus className="h-4 w-4" /> Add User
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold whitespace-nowrap">
              {users.length} Total Users
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Name & Email</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Department</th>
                <th className="text-right py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">No users found.</td>
                </tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                        {u.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3"/> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-semibold">{u.role}</td>
                  <td className="py-4 px-6 text-slate-500 flex items-center gap-1 mt-2">
                    <Building className="h-4 w-4"/> {u.department || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-md">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1E40AF, #1E3A8A)' }}>
              <h3 className="text-lg font-bold text-white">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                    <option value="CANDIDATE">Candidate</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder-slate-400" placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
                  {isSubmitting ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
