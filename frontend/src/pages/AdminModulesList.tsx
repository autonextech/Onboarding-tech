import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, BookOpen, Trash2, Edit, MoreVertical, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Module {
  id: string;
  title: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  sections: any[];
  createdAt: string;
}

export default function AdminModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchModules = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/modules');
      if (!res.ok) throw new Error('Failed to fetch modules');
      const data = await res.json();
      setModules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/modules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete module');
      
      setModules(modules.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting module.');
    }
  };

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Module Management</h2>
          <p className="text-sm text-slate-500">Create and oversee onboarding lesson paths.</p>
        </div>
        <button onClick={() => navigate('/admin/modules/new')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md"
          style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
          <Plus className="h-4 w-4" /> Create Module
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold whitespace-nowrap">
              {modules.length} Total Modules
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading modules from database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
            <AnimatePresence>
              {filteredModules.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 italic">No modules found. Start by creating one!</div>
              ) : filteredModules.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border text-left border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff', color: '#1E40AF' }}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${m.status.toLowerCase() === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {m.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{m.title}</h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow">{m.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-slate-400" />
                      {m.sections?.length || 0} Sections
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/modules/new?edit=${m.id}`)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(m.id, m.title)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
