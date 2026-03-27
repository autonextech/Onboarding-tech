import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Trash2, Power, Upload, Download, Users } from 'lucide-react';
import TeamManagerModal from '../components/TeamManagerModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  isActive: boolean;
  mentorId: string | null;
  mentor: { id: string; name: string; email: string } | null;
  createdAt: string;
}

interface MentorOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [mentorsError, setMentorsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CANDIDATE' | 'MENTOR'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managingTeamFor, setManagingTeamFor] = useState<{ id: string, name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CANDIDATE',
    department: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/mentors`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response format');
      setMentors(data);
      setMentorsError(null);
    } catch (err: any) {
      console.error('Failed to fetch mentors:', err);
      setMentorsError(err.message || 'Could not load mentors');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMentors();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add user');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'CANDIDATE', department: '' });
      fetchUsers();
      fetchMentors();
    } catch (err) {
      console.error(err);
      alert('Error creating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignMentor = async (userId: string, mentorId: string) => {
    try {
      await fetch(`${API_URL}/api/users/${userId}/assign-mentor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentorId || null })
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await fetch(`${API_URL}/api/users/${userId}/toggle-active`, { method: 'PUT' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${API_URL}/api/users/${userId}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const candidateCount = users.filter(u => u.role === 'CANDIDATE').length;
  const mentorCount = users.filter(u => u.role === 'MENTOR').length;

  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/users/bulk-import`, { method: 'POST', body: formData });
      const result = await res.json();
      setImportResult(result);
      fetchUsers();
      fetchMentors();
    } catch (err) {
      console.error(err);
      alert('Import failed.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>User Management</h2>
          <p className="text-sm text-slate-500">Manage candidates and mentors.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={`${API_URL}/api/users/sample-excel`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            <Download className="h-3.5 w-3.5" /> Sample Excel
          </a>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" /> Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleBulkImport} ref={fileInputRef} className="hidden" />
          </label>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md"
            style={{ background: '#1d3989' }}>
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>
      </motion.div>

      {/* Import Result Banner */}
      {importResult && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-lg border bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-800">
              ✅ {importResult.created} users created, {importResult.skipped} skipped
            </p>
            <button onClick={() => setImportResult(null)} className="text-green-600 hover:text-green-800 text-sm">&times;</button>
          </div>
          {importResult.errors?.length > 0 && (
            <ul className="mt-2 text-xs text-green-700 space-y-0.5">
              {importResult.errors.slice(0, 5).map((err: string, i: number) => <li key={i}>• {err}</li>)}
            </ul>
          )}
        </motion.div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'CANDIDATE', 'MENTOR'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {tab === 'ALL' ? `All (${users.length})` : tab === 'CANDIDATE' ? `Candidates (${candidateCount})` : `Mentors (${mentorCount})`}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container mb-6">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Name & Email</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Mentor</th>
                <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-right py-3 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 italic">No users found.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: u.role === 'MENTOR' ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)' : '#1d3989' }}>
                        {u.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3"/> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'MENTOR' ? 'bg-cyan-50 text-cyan-700' : u.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 'bg-primary/5 text-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {u.role === 'CANDIDATE' ? (
                      <select value={u.mentorId || ''} onChange={e => handleAssignMentor(u.id, e.target.value)}
                        className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary outline-none min-w-[140px]">
                        <option value="">{mentorsError ? '⚠ Failed to load' : 'Unassigned'}</option>
                        {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === 'CANDIDATE' && (
                        <button onClick={() => setManagingTeamFor({ id: u.id, name: u.name })} title="Manage Team"
                          className="p-2 rounded-md transition-colors text-primary bg-purple-50 hover:bg-primary/10">
                          <Users className="h-4 w-4" />
                        </button>
                      )}
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => handleToggleActive(u.id)} title={u.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-md transition-colors ${u.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: '#1d3989' }}>
              <h3 className="text-lg font-bold text-white">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-slate-400" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-slate-400" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white">
                    <option value="CANDIDATE">Candidate</option>
                    <option value="MENTOR">Mentor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm placeholder-slate-400" placeholder="e.g. Engineering" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50" style={{ background: '#1d3989' }}>
                  {isSubmitting ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Team Modal */}
      {managingTeamFor && (
        <TeamManagerModal 
          candidateId={managingTeamFor.id} 
          candidateName={managingTeamFor.name} 
          onClose={() => setManagingTeamFor(null)} 
        />
      )}
    </div>
  );
}
