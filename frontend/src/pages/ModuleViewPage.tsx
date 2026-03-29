import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

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

  if (loading) return <div className="p-12 text-center text-slate-500 font-body">Loading module architecture...</div>;
  if (!moduleData) return <div className="p-12 text-center text-slate-500 font-body">Module not found.</div>;

  const currentIndex = moduleData.sections.findIndex((s: any) => !completedSections.has(s.id));
  const activeSectionIndex = currentIndex === -1 ? moduleData.sections.length - 1 : currentIndex;
  const currentSection = moduleData.sections[activeSectionIndex];

  const getEmbeddedDriveUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    if (url.includes('/preview')) return url;
    if (url.includes('/view')) return url.replace('/view', '/preview');
    return url;
  };

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
      handleMarkComplete(sectionId);
    } catch (e) {
      console.error(e);
    }
  };

  const totalSections = moduleData.sections.length;
  const totalCompleted = completedSections.size;
  const overallProgress = totalSections === 0 ? 0 : Math.round((totalCompleted / totalSections) * 100);

  return (
    <div className="flex flex-col xl:flex-row min-h-full bg-surface">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-8 md:py-12 animate-in fade-in duration-500">
        <header className="mb-12">
          <div className="flex items-center space-x-2 text-primary font-medium mb-4">
            <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-sm hover:text-primary-container cursor-pointer transition-colors">arrow_back</button>
            <span className="text-xs uppercase tracking-[0.2em]">{moduleData.title}</span>
            <span className="h-px w-8 bg-tertiary-fixed-dim/50"></span>
            <span className="text-xs uppercase tracking-[0.2em]">Learning Pathway</span>
          </div>
          {currentSection && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-[1.15] headline-font pr-4">
              Section {activeSectionIndex + 1}: <br className="hidden sm:block" />
              <span className="text-primary">{currentSection.title}</span>
            </h1>
          )}

          {/* Assessment Link - shown when set by admin */}
          {moduleData.assessmentUrl && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-amber-50 border border-amber-200 rounded-xl px-4 sm:px-5 py-3 w-full sm:w-auto">
              <span className="material-symbols-outlined text-amber-600 text-xl hidden sm:block">emoji_events</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] sm:hidden">emoji_events</span>
                  Assessment Available
                </p>
                <p className="text-xs text-amber-700 mt-0.5">Complete this module's formal assessment to get certified.</p>
              </div>
              <a
                href={moduleData.assessmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center px-4 py-2.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 mt-2 sm:mt-0"
              >
                Take Assessment ↗
              </a>
            </div>
          )}
        </header>

        {currentSection && (
          <>
            {/* Tabs */}
            <div className="flex space-x-6 sm:space-x-8 border-b border-surface-container-high mb-8 sm:mb-12 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('content')} 
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'content' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Learning Material
              </button>
              {currentSection.questions && currentSection.questions.length > 0 && (
                <button 
                  onClick={() => setActiveTab('quiz')} 
                  className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'quiz' ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Knowledge Check <span className="material-symbols-outlined text-sm">quiz</span>
                </button>
              )}
            </div>

            {activeTab === 'content' && (
              <div className="space-y-12 pb-12">
                {currentSection.videoUrl && (
                  <section className="relative group">
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(15,23,42,0.06)] bg-surface-container-highest flex items-center justify-center relative border border-white/50">
                      <iframe 
                        src={getEmbeddedDriveUrl(currentSection.videoUrl)} 
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay" 
                        allowFullScreen
                        title="Module Video"
                      />
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6 text-on-surface-variant leading-relaxed text-lg font-body">
                    <p>{currentSection.description}</p>
                    
                    {currentSection.documents?.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Required Documents</h4>
                        <div className="space-y-3">
                          {currentSection.documents.map((doc: any) => (
                            <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-5 bg-surface-container-lowest border border-surface-container hover:border-primary/20 rounded-xl transition-all group overflow-hidden relative shadow-sm">
                              <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform">article</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-on-surface truncate">{doc.title}</p>
                                <p className="text-[10px] text-outline uppercase tracking-wider mt-0.5">{doc.type}</p>
                              </div>
                              <span className="material-symbols-outlined text-sm text-outline group-hover:text-primary transition-colors">open_in_new</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <aside className="lg:col-span-1">
                    <div className="bg-surface-container-low rounded-xl p-8 border-l-4 border-secondary shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full"></div>
                      <h3 className="font-bold text-on-surface mb-4 text-xl tracking-tight headline-font">Executive Briefing</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 italic">"True authority in complex systems isn't about control—it's about the clarity of the underlying structure."</p>
                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-outline">
                          <span>Significance</span>
                          <span className="text-primary">High</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-3/4 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && currentSection.questions && (
              <section className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 mb-12 shadow-[0_20px_40px_rgba(15,23,42,0.06)] border border-surface-container pb-12 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center space-x-3 mb-8 border-b border-surface-container-high pb-6">
                  <span className="material-symbols-outlined text-tertiary-container text-3xl">quiz</span>
                  <h2 className="text-2xl font-bold tracking-tight headline-font">Knowledge Check</h2>
                </div>
                
                <div className="space-y-12">
                  {quizSubmitted[currentSection.id] ? (
                    <div className="bg-primary rounded-xl p-8 text-center shadow-xl text-white relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
                      <span className="material-symbols-outlined text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      <h3 className="text-2xl font-bold headline-font mb-2">Certification Granted</h3>
                      <p className="text-blue-100/80 mb-6 font-body">Executive alignment verified with a score of <span className="font-bold text-white text-xl">{quizSubmitted[currentSection.id].score}%</span>.</p>
                      <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-md">
                        <span className="font-bold text-xs uppercase tracking-widest">{quizSubmitted[currentSection.id].correctCount} of {quizSubmitted[currentSection.id].totalQuestions} Targets Met</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentSection.questions.map((q: any, i: number) => (
                        <div key={q.id}>
                          <p className="text-lg font-medium mb-6 text-on-surface font-body"><span className="font-bold mr-2 text-primary">{i+1}.</span>{q.question || q.questionText}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {parseOptions(q.options).map((opt: string, optIdx: number) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              return (
                                <button 
                                  key={optIdx}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                                  className={`text-left p-5 rounded-xl transition-all group relative overflow-hidden cursor-pointer ${
                                    isSelected 
                                    ? 'border-2 border-primary bg-primary/5 shadow-sm' 
                                    : 'border border-outline-variant/30 bg-surface-container hover:bg-secondary-container/10'
                                  }`}
                                >
                                  <span className={`block font-body ${isSelected ? 'font-bold text-primary' : 'font-medium text-slate-700'}`}>{opt}</span>
                                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${isSelected ? 'text-primary opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                                    <span className="material-symbols-outlined" style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Actions Footer */}
            <footer className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-surface-container-high mt-8">
              {!completedSections.has(currentSection.id) && activeTab === 'content' && (!currentSection.questions || currentSection.questions.length === 0) ? (
                <button onClick={() => handleMarkComplete(currentSection.id)} className="px-8 py-4 w-full md:w-auto rounded-lg font-bold text-primary bg-surface-bright border border-primary/20 hover:bg-primary/5 transition-all text-sm uppercase tracking-widest cursor-pointer font-body flex justify-center items-center">
                  Sign-Off Section <span className="material-symbols-outlined ml-2 text-sm">verified</span>
                </button>
              ) : activeTab === 'quiz' && !quizSubmitted[currentSection.id] ? (
                <button 
                  onClick={() => handleQuizSubmit(currentSection.id)}
                  disabled={Object.keys(selectedAnswers).length < currentSection.questions.length}
                  className="px-8 py-4 w-full md:w-auto rounded-lg font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm uppercase tracking-widest cursor-pointer disabled:opacity-50 font-body focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Submit Briefing
                </button>
              ) : (
                 <div className="flex-1" />
              )}
              
              {completedSections.has(currentSection.id) && (
                 <button onClick={() => {
                   const nextIdx = moduleData.sections.findIndex((s: any, idx: number) => idx > activeSectionIndex && !completedSections.has(s.id));
                   if (nextIdx !== -1) navigate(`/module/${moduleId}`); // refresh triggers state recompute
                   else navigate('/dashboard');
                 }} className="px-8 py-4 w-full md:w-auto rounded-lg font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2 text-sm uppercase tracking-widest cursor-pointer font-body">
                  <span>{activeSectionIndex === moduleData.sections.length - 1 ? 'Complete Module' : 'Next Section'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </footer>
          </>
        )}
      </div>

      <aside className="hidden xl:block w-80 bg-surface-container-low border-l border-surface-container relative flex-shrink-0 animate-in slide-in-from-right duration-500">
        <div className="h-full py-12 px-8 overflow-y-auto">
          <h4 className="text-xs font-black uppercase tracking-[0.25em] text-outline mb-10 headline-font">Module Navigation</h4>
          <div className="space-y-0 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant/20"></div>
            
            {moduleData.sections.map((s: any, idx: number) => {
              const isComplete = completedSections.has(s.id);
              const isCurrent = activeSectionIndex === idx;
              const isLocked = !isComplete && !isCurrent && currentIndex !== -1 && idx > currentIndex;

              return (
                <div key={s.id} className={`relative pl-8 pb-10 transition-opacity ${isLocked ? 'opacity-50' : 'opacity-100'}`}>
                  {isComplete ? (
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                      <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-4 border-primary z-10 shadow-sm"></div>
                  ) : (
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface-variant border-4 border-surface-container-low z-10"></div>
                  )}
                  
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isComplete || isCurrent ? 'text-primary' : 'text-outline'}`}>
                    Section {idx + 1}
                  </p>
                  <h5 className={`text-sm font-bold font-body ${isCurrent || isComplete ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.title}</h5>
                  {isCurrent && <p className="text-xs text-on-surface-variant mt-2 italic font-body">Currently Reading</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/20">
            <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-xs font-body">
                <span className="text-on-surface-variant font-semibold">Total Alignment</span>
                <span className="font-bold text-primary text-sm">{overallProgress}%</span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }}></div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed font-body">
                You have {totalSections - totalCompleted} sections remaining in this module to reach your weekly milestone.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
