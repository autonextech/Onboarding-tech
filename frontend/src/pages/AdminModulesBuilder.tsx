import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, ArrowLeft } from 'lucide-react';
import ModuleSectionCard from '../components/admin/ModuleSectionCard';
import type { SectionData } from '../components/admin/ModuleSectionCard';

export default function AdminModulesBuilder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isSaving, setIsSaving] = useState(false);
  
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: '1',
      title: 'Welcome to the Company',
      description: 'Company history, culture, and our core values.',
      videoUrl: 'https://example.com/video',
      videoDuration: '15:30',
      document: { title: 'Employee Handbook', type: 'PDF', url: '#' },
      questions: [
        { id: 'q1', question: 'When was the company founded?', options: ['2005', '2008', '2010', '2012'], correctIndex: 1 }
      ]
    }
  ]);

  const addSection = () => {
    setSections([...sections, {
      id: Math.random().toString(36).substring(7),
      title: '',
      description: '',
      videoUrl: '',
      videoDuration: '',
      questions: []
    }]);
  };

  const updateSection = (newData: SectionData) => {
    setSections(sections.map((s: SectionData) => s.id === newData.id ? newData : s));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s: SectionData) => s.id !== id));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('http://localhost:3000/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, sections })
      });
      
      if (!res.ok) throw new Error('Failed to save module');
      
      alert('Module successfully saved to the database!');
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Error saving module. Please make sure the backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </button>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Create Module</h2>
            <p className="text-sm text-slate-500">Build interactive onboarding courses.</p>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)' }}>
            <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Module Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-t-4" style={{ borderTopColor: '#1E40AF' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Module Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. Welcome to the Company"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-slate-900"
                rows={3}
                placeholder="Brief overview of what candidates will learn..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${status === 'published' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${status === 'draft' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Draft
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sections Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Sections</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {sections.length} section(s) • Unlocked sequentially
            </span>
          </div>
        </motion.div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.map((section: SectionData, idx: number) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}>
              <ModuleSectionCard
                index={idx}
                section={section}
                onChange={updateSection}
                onRemove={() => removeSection(section.id)}
              />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-2">
          <button onClick={addSection} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
            <Plus className="h-5 w-5" /> Add Section
          </button>
        </motion.div>
      </div>
    </div>
  );
}
