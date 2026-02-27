import React, { useState, useEffect } from 'react';
import { ProsodyAnalysis, EvaluationResult } from '../types';
import { evaluateStudentAnalysis } from '../services/geminiService';

interface EvaluationPanelProps {
  analysis: ProsodyAnalysis;
  initialInput?: string;
}

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({ analysis, initialInput }) => {
  const [studentInput, setStudentInput] = useState(initialInput || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    if (initialInput) {
      setStudentInput(initialInput);
      // Auto-trigger evaluation if initial input is substantial
      if (initialInput.length > 3) {
        handleEvaluate(initialInput);
      }
    }
  }, [initialInput]);

  const handleEvaluate = async (overrideInput?: string) => {
    const inputToUse = overrideInput || studentInput;
    if (!inputToUse.trim()) return;
    setLoading(true);
    try {
      const evaluation = await evaluateStudentAnalysis(analysis.original, inputToUse, analysis);
      setResult(evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSymbol = (s: string) => {
    setStudentInput(prev => prev + s);
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/5 mt-12 animate-in slide-in-from-top-6 duration-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">معمل التقطيع اليدوي</h3>
            <p className="text-slate-500">قم بتقطيع البيت رمزياً لاختبار دقتك</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <p className="text-2xl font-amiri text-slate-700 mb-2">البيت المراد تقطيعه:</p>
          <p className="text-4xl font-amiri font-bold text-indigo-900 leading-relaxed">{analysis.diacritized}</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              dir="ltr"
              className="w-full p-8 text-5xl font-mono tracking-[0.4em] text-center bg-white border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-lg"
              placeholder="_ _ _ _"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value.replace(/[^/0]/g, ''))}
            />
            {studentInput.length > 0 && (
              <button 
                onClick={() => setStudentInput('')}
                className="absolute top-1/2 -translate-y-1/2 left-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                title="مسح"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => addSymbol('/')}
              className="group flex flex-col items-center gap-2 p-6 bg-white border-2 border-amber-100 rounded-[2rem] hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-90 shadow-sm"
            >
              <span className="text-5xl font-bold text-amber-600">/</span>
            </button>
            <button 
              onClick={() => addSymbol('0')}
              className="group flex flex-col items-center gap-2 p-6 bg-white border-2 border-blue-100 rounded-[2rem] hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-90 shadow-sm"
            >
              <span className="text-5xl font-bold text-blue-600">0</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => handleEvaluate()}
          disabled={loading || !studentInput.trim()}
          className={`w-full py-5 text-2xl font-bold rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4
            ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200'}`}
        >
          {loading ? 'جاري التحليل التربوي...' : 'إرسال التقطيع للتقييم'}
        </button>
      </div>

      {result && (
        <div className={`mt-12 p-10 rounded-[2.5rem] border-4 transition-all animate-in zoom-in-95 duration-500 shadow-xl
          ${result.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/50 pb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl
                ${result.isCorrect ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                {result.isCorrect ? '✓' : '!'}
              </div>
              <h4 className={`text-2xl font-bold ${result.isCorrect ? 'text-emerald-900' : 'text-orange-900'}`}>
                {result.isCorrect ? 'تقطيع متقن تماماً!' : 'هناك بعض الملاحظات..'}
              </h4>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${result.isCorrect ? 'text-emerald-600' : 'text-orange-600'}`}>{result.score}%</div>
            </div>
          </div>
          
          <p className={`text-xl mb-8 leading-relaxed font-Tajawal ${result.isCorrect ? 'text-emerald-800' : 'text-orange-800'}`}>
            {result.feedback}
          </p>

          {!result.isCorrect && (
            <div className="mt-6 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-orange-200 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">تقطيعك</p>
                  <p className="text-3xl font-mono tracking-widest text-orange-400" dir="ltr">{studentInput}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">الصحيح</p>
                  <p className="text-3xl font-mono tracking-widest text-emerald-600" dir="ltr">{result.correctedPattern}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationPanel;