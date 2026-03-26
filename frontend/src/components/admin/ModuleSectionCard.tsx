import { GripVertical, Trash2, Video, FileText, CheckCircle2, Circle, Plus } from 'lucide-react';

export interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SectionDocument {
  title: string;
  type: string;
  url: string;
}

export interface SectionData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: string;
  document?: SectionDocument;
  questions: QuizQuestionData[];
}

interface Props {
  index: number;
  section: SectionData;
  onChange: (data: SectionData) => void;
  onRemove: () => void;
}

export default function ModuleSectionCard({ index, section, onChange, onRemove }: Props) {
  const updateField = (field: keyof SectionData, value: any) => {
    onChange({ ...section, [field]: value });
  };

  const addQuestion = () => {
    onChange({
      ...section,
      questions: [
        ...section.questions,
        { id: Math.random().toString(36).substring(7), question: '', options: ['', '', '', ''], correctIndex: 0 }
      ]
    });
  };

  const updateQuestion = (qId: string, field: keyof QuizQuestionData, value: any) => {
    onChange({
      ...section,
      questions: section.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
    });
  };

  const updateOption = (qId: string, optIndex: number, value: string) => {
    onChange({
      ...section,
      questions: section.questions.map(q => {
        if (q.id === qId) {
          const newOpts = [...q.options];
          newOpts[optIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    });
  };

  const removeQuestion = (qId: string) => {
    onChange({
      ...section,
      questions: section.questions.filter(q => q.id !== qId)
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
          <span className="font-semibold text-slate-700">#{index + 1}</span>
          <input
            type="text"
            value={section.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="Section Title"
            className="bg-transparent border-none font-semibold text-slate-900 focus:outline-none focus:ring-0 placeholder-slate-400 w-64"
          />
        </div>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 transition-colors p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={section.description}
            onChange={e => updateField('description', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:border-blue-500 focus:outline-none placeholder-slate-400"
            rows={2}
            placeholder="What will candidates learn in this section?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Video className="h-4 w-4 text-slate-400"/> Video URL</label>
            <input
              type="text"
              value={section.videoUrl}
              onChange={e => updateField('videoUrl', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:border-blue-500 focus:outline-none placeholder-slate-400"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <input
              type="text"
              value={section.videoDuration}
              onChange={e => updateField('videoDuration', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:border-blue-500 focus:outline-none placeholder-slate-400"
              placeholder="e.g. 15:30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><FileText className="h-4 w-4 text-slate-400"/> Attached Document</label>
          {section.document ? (
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">{section.document.title}</span>
                <span className="text-xs text-slate-500 uppercase">{section.document.type}</span>
              </div>
              <button onClick={() => updateField('document', undefined)} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
            </div>
          ) : (
            <button onClick={() => updateField('document', { title: 'Employee Handbook', type: 'PDF', url: '#' })} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              + Add Document
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-medium text-slate-900 font-semibold" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Quiz Questions</h4>
          </div>
          
          <div className="space-y-4">
            {section.questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex justify-between gap-4 mb-3">
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:border-blue-500 focus:outline-none font-medium placeholder-slate-400"
                    placeholder={`Question ${qIdx + 1}`}
                  />
                  <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors">
                    Remove Question
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button onClick={() => updateQuestion(q.id, 'correctIndex', optIdx)} className="focus:outline-none">
                        {q.correctIndex === optIdx ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(q.id, optIdx, e.target.value)}
                        className={`flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none transition-colors ${q.correctIndex === optIdx ? 'border-green-300 bg-green-50' : 'border-slate-300 focus:border-blue-500'}`}
                        placeholder={`Option ${optIdx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={addQuestion} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group">
             <span className="flex items-center justify-center bg-blue-100 text-blue-600 rounded-full h-5 w-5 group-hover:bg-blue-200 transition-colors"><Plus className="h-3 w-3" /></span>
             Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
