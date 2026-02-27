
import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import QuizPanel from './QuizPanel';

interface StandaloneQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const StandaloneQuiz: React.FC<StandaloneQuizProps> = ({ onComplete }) => {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGeneralQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Generate a comprehensive Arabic prosody (Arud) quiz for students. 
        The quiz should have 5 multiple-choice questions covering:
        1. Basic rules of prosodic writing.
        2. Identifying common Taf'ilat (feet).
        3. Identifying famous poetic meters (Buhur).
        4. Rules of Zihaf and Ilal.
        5. General history or terminology of Arud.
        
        Provide the response in Arabic.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswerIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
              }
            },
            required: ["quiz"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const data = JSON.parse(text);
      setQuiz(data.quiz);
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setError("لقد تجاوزت حصة الاستخدام المتاحة. يرجى محاولة تغيير مفتاح API الخاص بك.");
      } else if (err.message?.includes('Requested entity was not found')) {
        setError("انتهت صلاحية جلسة مفتاح API. يرجى إعادة اختيار المفتاح من أسفل الصفحة.");
      } else {
        setError("فشل في توليد الاختبار. يرجى المحاولة مرة أخرى.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateGeneralQuiz();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-bold text-lg">جاري تحضير أسئلة الاختبار الشامل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button 
          onClick={generateGeneralQuiz}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {quiz && <QuizPanel quiz={quiz} onComplete={onComplete} />}
    </div>
  );
};

export default StandaloneQuiz;
