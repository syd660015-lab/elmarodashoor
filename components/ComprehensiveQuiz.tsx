
import React from 'react';
import QuizPanel from './QuizPanel';
import { COMPREHENSIVE_QUIZ } from '../data/comprehensiveQuiz';

interface ComprehensiveQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const ComprehensiveQuiz: React.FC<ComprehensiveQuizProps> = ({ onComplete }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full opacity-10 -mr-16 -mt-16"></div>
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-indigo-400">★</span>
          الاختبار الشامل: علم العروض بين التراث والحوسبة الذكية
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          اختبار متكامل يغطي الجوانب التراثية والتقنية الحديثة لعلم العروض، مصمم لتقييم استيعابك العميق للمنهج المقترح.
        </p>
      </div>
      
      <QuizPanel quiz={COMPREHENSIVE_QUIZ} onComplete={onComplete} />
    </div>
  );
};

export default ComprehensiveQuiz;
