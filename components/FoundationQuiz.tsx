
import React from 'react';
import QuizPanel from './QuizPanel';
import { FOUNDATION_QUIZ } from '../data/foundationQuiz';

interface FoundationQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const FoundationQuiz: React.FC<FoundationQuizProps> = ({ onComplete }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">الاختبار التأسيسي في علم العروض</h3>
        <p className="text-indigo-700 text-sm leading-relaxed">
          هذا الاختبار مصمم لقياس فهمك للمفاهيم الأساسية في علم العروض وحوسبته، بناءً على المنهج العلمي المقترح في كتاب "حوسبة علم العروض".
        </p>
      </div>
      
      <QuizPanel quiz={FOUNDATION_QUIZ} onComplete={onComplete} />
    </div>
  );
};

export default FoundationQuiz;
