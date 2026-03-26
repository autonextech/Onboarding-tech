import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Plus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface TeamManagerModalProps {
  candidateId: string;
  candidateName: string;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TeamManagerModal({ candidateId, candidateName, onClose }: TeamManagerModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/team`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [candidateId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/${candidateId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, role: newRole })
      });
      if (res.ok) {
        setNewName('');
        setNewRole('');
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      await fetch(`${API_URL}/api/candidates/team/${teamId}`, { method: 'DELETE' });
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10" style={{ background: '#1d3989' }}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><Users className="h-5 w-5 text-white" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">Manage Team</h3>
              <p className="text-xs text-white/80">For {candidateName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1">
              <input type="text" placeholder="Member Name" required value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-400" />
            </div>
            <div className="flex-1">
              <input type="text" placeholder="Role (e.g. Buddy, Manager)" required value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-slate-400" />
            </div>
            <button type="submit" disabled={adding} className="bg-primary hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 justify-center transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>

          {loading ? (
            <div className="text-center text-slate-500 py-8 text-sm font-medium">Loading team members...</div>
          ) : members.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-white rounded-xl border border-dashed border-slate-300">
              <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No team members assigned</p>
              <p className="text-xs text-slate-400 mt-1">Add a buddy, manager, or teammate above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-purple-200 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
                      {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs font-semibold text-primary bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">{member.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
