import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Plus, ArrowLeft, Link2, Loader2 } from 'lucide-react';
import ModuleSectionCard from '../components/admin/ModuleSectionCard';
import type { SectionData } from '../components/admin/ModuleSectionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminModulesBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assessmentUrl, setAssessmentUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [sections, setSections] = useState<SectionData[]>([]);

  // Load existing module if editing
  useEffect(() => {
    if (!editId) return;
    setIsLoading(true);
    fetch(`${API_URL}/api/modules/${editId}`)
      .then(r => r.json())
      .then(data => {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setAssessmentUrl(data.assessmentUrl || '');
        setStatus(data.status?.toLowerCase() === 'draft' ? 'draft' : 'published');
        
        // Map sections from DB format to component format
        const mappedSections: SectionData[] = (data.sections || []).map((s: any) => ({
          id: s.id,
          title: s.title || '',
          description: s.description || '',
          videoUrl: s.videoUrl || '',
          videoDuration: s.videoDuration || '',
          document: s.documents?.[0] ? {
            title: s.documents[0].title,
            type: s.documents[0].type,
            url: s.documents[0].url
          } : undefined,
          questions: (s.questions || []).map((q: any) => {
            let opts: string[] = [];
            try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch { opts = []; }
            return {
              id: q.id,
              question: q.question || '',
              options: opts.length === 4 ? opts : ['', '', '', ''],
              correctIndex: q.correctOptionIndex ?? 0
            };
          })
        }));
        setSections(mappedSections);
      })
      .catch(err => {
        console.error('Failed to load module:', err);
        alert('Failed to load module for editing.');
      })
      .finally(() => setIsLoading(false));
  }, [editId]);

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
    if (!title.trim()) {
      alert('Please enter a module title.');
      return;
    }
    try {
      setIsSaving(true);
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/api/modules/${editId}` : `${API_URL}/api/modules`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, assessmentUrl: assessmentUrl || null, sections })
      });
      
      if (!res.ok) throw new Error('Failed to save module');
      
      alert(editId ? 'Module updated successfully!' : 'Module created successfully!');
      navigate('/admin/modules');
    } catch (err) {
      console.error(err);
      alert('Error saving module. Please make sure the backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading module data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => navigate('/admin/modules')} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Modules
        </button>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {editId ? 'Edit Module' : 'Create Module'}
            </h2>
            <p className="text-sm text-slate-500">
              {editId ? 'Update this module\'s content and settings.' : 'Build interactive onboarding courses with real content.'}
            </p>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md disabled:opacity-50"
            style={{ background: '#1d3989' }}>
            <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : (editId ? 'Update Module' : 'Save Module')}
          </button>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Module Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container p-6 border-t-4" style={{ borderTopColor: '#1d3989' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Module Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. Welcome to the Company" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-slate-900"
                rows={3} placeholder="Brief overview of what candidates will learn..." />
            </div>

            {/* Assessment URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Link2 className="h-4 w-4 text-purple-500" /> Assessment Link (Optional)
              </label>
              <input type="url" value={assessmentUrl} onChange={e => setAssessmentUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm text-slate-900"
                placeholder="https://your-assessment-portal.com/test/..." />
              <p className="text-xs text-slate-400 mt-1">Candidates will see a "Take Assessment" button that opens this link.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button type="button" onClick={() => setStatus('published')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${status === 'published' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  Published
                </button>
                <button type="button" onClick={() => setStatus('draft')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${status === 'draft' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  Draft
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sections Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Sections</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {sections.length} section(s)
            </span>
          </div>
        </motion.div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
              No sections yet. Click "Add Section" below to start building your module.
            </div>
          )}
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
          <button onClick={addSection} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
            <Plus className="h-5 w-5" /> Add Section
          </button>
        </motion.div>
      </div>
    </div>
  );
}
