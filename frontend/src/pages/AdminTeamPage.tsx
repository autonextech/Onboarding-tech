import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Mail, Globe, MessageCircle, Building2, Pencil, X, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const emptyForm = { name: '', role: '', department: '', email: '', linkedin: '', slack: '' };

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/team`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setTeam(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch team:', err);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const openAdd = () => {
    setEditingMember(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      department: member.department || '',
      email: member.email || '',
      linkedin: member.linkedin || '',
      slack: member.slack || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingMember ? `${API_URL}/api/team/${editingMember.id}` : `${API_URL}/api/team`;
      const method = editingMember ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ ...emptyForm });
        setShowForm(false);
        setEditingMember(null);
        fetchTeam();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to save team member');
      }
    } catch (err) {
      alert('Network error — could not save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this team member from the directory?')) return;
    try {
      await fetch(`${API_URL}/api/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading team members...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-3">Company Team</h2>
          <p className="text-sm text-slate-500 mt-1 pl-4">Manage the global employee directory visible to all candidates.</p>
        </div>
        <button onClick={openAdd} className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">{editingMember ? 'Edit Team Member' : 'New Team Member Profile'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Emily Rodriguez" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role / Job Title *</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. HR Business Partner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Department *</label>
                <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. Human Resources" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="e.g. emily.rodriguez@company.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">LinkedIn Full URL</label>
                <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://linkedin.com/in/emilyrodriguez" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Slack Channel / DM Link</label>
                <input type="url" value={formData.slack} onChange={e => setFormData({...formData, slack: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="https://yourworkspace.slack.com/team/U01234" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {submitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Add to Directory'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-6 text-xs uppercase tracking-wider text-slate-500 font-bold">Colleague</th>
              <th className="py-3 px-6 text-xs uppercase tracking-wider text-slate-500 font-bold">Department</th>
              <th className="py-3 px-6 text-xs uppercase tracking-wider text-slate-500 font-bold">Contact Links</th>
              <th className="py-3 px-6 text-xs uppercase tracking-wider text-slate-500 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {team.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">
                  <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No team members added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Add colleagues so candidates can meet them.</p>
                </td>
              </tr>
            ) : (
              team.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {member.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {member.department}
                    </span>
                  </td>
                  <td className="py-4 px-6 space-y-1">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-primary transition-colors">
                        <Mail className="h-3 w-3 shrink-0" /> {member.email}
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#0A66C2] hover:underline transition-colors">
                        <Globe className="h-3 w-3 shrink-0" /> LinkedIn ↗
                      </a>
                    )}
                    {member.slack && (
                      <a href={member.slack} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#4A154B] hover:underline transition-colors">
                        <MessageCircle className="h-3 w-3 shrink-0" /> Slack ↗
                      </a>
                    )}
                    {!member.email && !member.linkedin && !member.slack && (
                      <span className="text-xs text-slate-400 italic">No contact info</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(member)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
