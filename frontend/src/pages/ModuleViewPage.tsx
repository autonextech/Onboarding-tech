import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CheckCircle2, PlayCircle, FileText, ArrowLeft, Loader2, Award, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ModuleViewPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { userId } = useStore();

  const [moduleData, setModuleData] = useState<any>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !moduleId) return;

    // OPTIMIZATION: Fetch module AND progress in parallel using the dedicated endpoint
    Promise.all([
      fetch(`${API_URL}/api/modules/${moduleId}`).then(res => res.json()),
      fetch(`${API_URL}/api/progress/${userId}`).then(res => res.json())
    ])
      .then(([moduleResult, progressResult]) => {
        if (moduleResult && moduleResult.sections) {
          moduleResult.sections.sort((a: any, b: any) => a.order - b.order);
        }
        setModuleData(moduleResult);
        setCompletedSections(new Set(progressResult.map((p: any) => p.sectionId)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, moduleId]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-purple-600" /></div>;
  if (!moduleData) return <div className="p-10 text-center">Module not found.</div>;

  // Find the first uncompleted section, or the last section if all complete
  const currentIndex = moduleData.sections.findIndex((s: any) => !completedSections.has(s.id));
  const activeSectionIndex = currentIndex === -1 ? moduleData.sections.length - 1 : currentIndex;
  const currentSection = moduleData.sections[activeSectionIndex];

  // Helper to convert Google Drive /view -> /preview
  const getEmbeddedDriveUrl = (url: string) => {
    if (!url) return '';
    // Extract file ID from various Google Drive URL formats
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    // Already a preview URL or non-Drive URL
    if (url.includes('/preview')) return url;
    if (url.includes('/view')) return url.replace('/view', '/preview');
    return url;
  };

  // Parse quiz options — stored as JSON string in DB
  const parseOptions = (options: any): string[] => {
    if (Array.isArray(options)) return options;
    try { return JSON.parse(options); } catch { return []; }
  };

  const handleMarkComplete = async (sectionId: string) => {
    try {
      await fetch(`${API_URL}/api/progress/section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, moduleId, sectionId })
      });
      setCompletedSections(new Set([...completedSections, sectionId]));
      setActiveTab('content');
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuizSubmit = async (sectionId: string) => {
    if (!currentSection || !currentSection.questions || currentSection.questions.length === 0) return;
    
    // Format answers
    const answers = currentSection.questions.map((q: any) => ({
      questionId: q.id,
      chosenIndex: selectedAnswers[q.id] ?? -1
    }));

    try {
      const res = await fetch(`${API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sectionId, answers })
      });
      const result = await res.json();
      setQuizSubmitted({ ...quizSubmitted, [sectionId]: result });
      
      // Also mark section complete
      handleMarkComplete(sectionId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-10">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm font-semibold text-purple-600 hover:text-purple-800 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: '#7E22CE' }}>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 font-instrument">
              {moduleData.title}
            </h1>
            <p className="text-slate-600">{moduleData.description}</p>
            {moduleData.assessmentUrl && (
              <a href={moduleData.assessmentUrl} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-shadow hover:shadow-lg shadow-md"
                style={{ background: 'linear-gradient(135deg, #7E22CE, #A855F7)' }}>
                <ExternalLink className="h-4 w-4" /> Take Assessment
              </a>
            )}
          </div>

          <AnimatePresence mode="wait">
            {currentSection && (
              <motion.div key={currentSection.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card overflow-hidden">
                
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #7E22CE, #581C87)' }}>
                  <h2 className="text-lg font-bold text-white">Section {activeSectionIndex + 1}: {currentSection.title}</h2>
                  {completedSections.has(currentSection.id) && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-300 bg-green-900/30 px-2 py-1 rounded-full"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50">
                  <button onClick={() => setActiveTab('content')} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'content' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    Learning Material
                  </button>
                  {currentSection.questions && currentSection.questions.length > 0 && (
                     <button onClick={() => setActiveTab('quiz')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                       Knowledge Check <Award className="h-4 w-4" />
                     </button>
                  )}
                </div>

                <div className="p-6">
                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      <p className="text-slate-700 text-lg leading-relaxed">{currentSection.description}</p>
                      
                      {currentSection.videoUrl && (
                        <div className="mt-6 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-black relative" style={{ paddingTop: '56.25%' }}>
                          <iframe 
                            src={getEmbeddedDriveUrl(currentSection.videoUrl)} 
                            className="absolute top-0 left-0 w-full h-full"
                            allow="autoplay" 
                            allowFullScreen
                            title="Module Video"
                          />
                        </div>
                      )}

                      {currentSection.documents?.length > 0 && (
                         <div className="mt-8">
                           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Resources</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {currentSection.documents.map((doc: any) => (
                               <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group bg-white">
                                 <div className="h-10 w-10 flex text-purple-600 bg-purple-50 rounded-lg items-center justify-center"><FileText className="h-5 w-5" /></div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700 truncate">{doc.title}</p>
                                   <p className="text-xs text-slate-500">{doc.type}</p>
                                 </div>
                               </a>
                             ))}
                           </div>
                         </div>
                      )}
                      
                      {!completedSections.has(currentSection.id) && (!currentSection.questions || currentSection.questions.length === 0) && (
                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                           <button onClick={() => handleMarkComplete(currentSection.id)} className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold cursor-pointer hover:shadow-lg transition-all" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                             Mark Section Complete <CheckCircle2 className="h-5 w-5" />
                           </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'quiz' && currentSection.questions && (
                    <div className="space-y-8">
                      {quizSubmitted[currentSection.id] ? (
                        <div className="p-6 rounded-xl bg-purple-50 border border-purple-100 text-center">
                          <Award className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                          <h3 className="text-xl font-bold text-slate-800">Knowledge Check Complete!</h3>
                          <p className="text-slate-600 mt-1">You scored <span className="font-bold text-purple-700">{quizSubmitted[currentSection.id].score}%</span> ({quizSubmitted[currentSection.id].correctCount} / {quizSubmitted[currentSection.id].totalQuestions} correct)</p>
                        </div>
                      ) : (
                        <>
                          {currentSection.questions.map((q: any, i: number) => (
                            <div key={q.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm">
                              <p className="text-sm font-bold text-slate-500 mb-2">Question {i + 1}</p>
                              <p className="text-lg font-medium text-slate-800 mb-4">{q.question || q.questionText}</p>
                              <div className="space-y-2">
                                {parseOptions(q.options).map((opt: string, optIdx: number) => (
                                  <label key={optIdx} className={`flex flex-col px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedAnswers[q.id] === optIdx ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <div className="flex items-center gap-3">
                                      <input type="radio" name={`q-${q.id}`} value={optIdx} className="w-4 h-4 text-purple-600"
                                        checked={selectedAnswers[q.id] === optIdx}
                                        onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                                      />
                                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end pt-4">
                            <button 
                              onClick={() => handleQuizSubmit(currentSection.id)} 
                              disabled={Object.keys(selectedAnswers).length < currentSection.questions.length}
                              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                            >
                              Submit Answers & Continue
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Menu */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="glass-card p-5 sticky top-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Module Content</h3>
            <div className="space-y-2 relative">
              <div className="absolute left-3.5 top-4 bottom-4 w-0.5 bg-slate-200 -z-10" />
              {moduleData.sections.map((s: any, idx: number) => {
                const isComplete = completedSections.has(s.id);
                const isCurrent = activeSectionIndex === idx;
                const isLocked = !isComplete && !isCurrent && currentIndex !== -1 && idx > currentIndex;

                return (
                  <div key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 bg-white transition-colors ${isComplete ? 'border-green-500 text-green-500' : isCurrent ? 'border-purple-600 text-purple-600 shadow-md' : 'border-slate-300 text-slate-400'}`}>
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                    </div>
                    <div className={`flex-1 pb-4 pt-1 transition-opacity ${isLocked ? 'opacity-50' : 'opacity-100'}`}>
                      <p className={`text-sm font-bold ${isCurrent ? 'text-purple-700' : 'text-slate-700'}`}>{s.title}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" /> {s.videoDuration || '5 mins'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
