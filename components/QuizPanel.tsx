
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizPanelProps {
  quiz: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

const QuizPanel: React.FC<QuizPanelProps> = ({ quiz, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === quiz[currentIdx].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
      if (onComplete) {
        onComplete(score, quiz.length);
      }
    }
  };

  if (finished) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-8 text-center animate-in zoom-in-95">
        <div className="text-5xl mb-4">🏆</div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">أنهيت اختبار المعارف!</h3>
        <p className="text-emerald-700 text-lg mb-4">لقد أجبت بشكل صحيح على {score} من أصل {quiz.length} أسئلة.</p>
        <button 
          onClick={() => { setFinished(false); setCurrentIdx(0); setScore(0); setSelectedOption(null); setShowExplanation(false); }}
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          إعادة الاختبار
        </button>
      </div>
    );
  }

  const q = quiz[currentIdx];

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-slate-400">السؤال {currentIdx + 1} من {quiz.length}</span>
        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h4 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
        {q.question}
      </h4>

      <div className="grid grid-cols-1 gap-3">
        {q.options.map((option, idx) => {
          let stateClass = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50";
          if (showExplanation) {
            if (idx === q.correctAnswerIndex) stateClass = "border-green-500 bg-green-50 text-green-800";
            else if (idx === selectedOption) stateClass = "border-red-400 bg-red-50 text-red-800";
            else stateClass = "border-slate-100 opacity-50";
          }

          return (
            <button
              key={idx}
              disabled={showExplanation}
              onClick={() => handleSelect(idx)}
              className={`p-4 text-right rounded-xl border-2 font-medium transition-all flex items-center gap-3 ${stateClass}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                ${showExplanation && idx === q.correctAnswerIndex ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                {idx === q.correctAnswerIndex && showExplanation ? '✓' : idx + 1}
              </div>
              {option}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
          <p className="text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">التفسير:</span>
            {q.explanation}
          </p>
          <button 
            onClick={nextQuestion}
            className="mt-6 w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-all"
          >
            السؤال التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPanel;
