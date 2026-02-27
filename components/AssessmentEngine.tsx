import React, { useState, useEffect } from 'react';
import { ProsodyAnalysis, AssessmentData } from '../types';
import { generateAssessment } from '../services/geminiService';
import EvaluationPanel from './EvaluationPanel';
import QuizPanel from './QuizPanel';

interface AssessmentEngineProps {
  analysis: ProsodyAnalysis;
  initialManualSymbols?: string;
  onQuizComplete?: (score: number, total: number) => void;
}

const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ analysis, initialManualSymbols, onQuizComplete }) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'knowledge'>('skills');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'knowledge' && !assessmentData) {
      loadKnowledgeQuiz();
    }
  }, [activeTab]);

  // If initial manual symbols are provided, ensure we are on the skills tab
  useEffect(() => {
    if (initialManualSymbols) {
      setActiveTab('skills');
    }
  }, [initialManualSymbols]);

  const loadKnowledgeQuiz = async () => {
    setLoading(true);
    try {
      const data = await generateAssessment(analysis);
      setAssessmentData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex p-1 bg-slate-100 rounded-2xl w-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${activeTab === 'skills' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          اختبار المهارات
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${activeTab === 'knowledge' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          اختبار المعارف
        </button>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'skills' ? (
          <EvaluationPanel 
            analysis={analysis} 
            initialInput={initialManualSymbols}
          />
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-bold">جاري تحضير أسئلة الاختبار...</p>
          </div>
        ) : assessmentData ? (
          <QuizPanel quiz={assessmentData.quiz} onComplete={onQuizComplete} />
        ) : (
          <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
            فشل تحميل الاختبار. يرجى المحاولة مرة أخرى.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentEngine;