
import React, { useState } from 'react';
import { CLASSICAL_METERS } from '../data/arudData';
import { QuizQuestion, MeterInfo } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import QuizPanel from './QuizPanel';

interface MeterSpecificQuizProps {
  onComplete?: (score: number, total: number) => void;
}

const MeterSpecificQuiz: React.FC<MeterSpecificQuizProps> = ({ onComplete }) => {
  const [selectedMeter, setSelectedMeter] = useState<MeterInfo | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMeterQuiz = async (meter: MeterInfo) => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Generate a specialized Arabic prosody (Arud) quiz about the poetic meter: "${meter.name}".
        The quiz should have 4 multiple-choice questions covering:
        1. The original Taf'ilat of "${meter.name}" (${meter.originalTafilat}).
        2. Accepted Zihafat for this meter (${meter.acceptedZihafat.join(', ')}).
        3. Accepted Ilal for this meter (${meter.acceptedIlal.join(', ')}).
        4. A specific rule or pattern unique to this meter.
        
        Provide the response in Arabic and ensure the questions are pedagogically sound.`,
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
        setError("فشل في توليد الاختبار الخاص بهذا البحر. يرجى المحاولة مرة أخرى.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMeterSelect = (meter: MeterInfo) => {
    setSelectedMeter(meter);
    generateMeterQuiz(meter);
  };

  const resetSelection = () => {
    setSelectedMeter(null);
    setQuiz(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-bold text-lg">جاري تحضير أسئلة اختبار بحر {selectedMeter?.name}...</p>
      </div>
    );
  }

  if (quiz) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-emerald-800">اختبار بحر {selectedMeter?.name}</h3>
          <button 
            onClick={resetSelection}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            تغيير البحر
          </button>
        </div>
        <QuizPanel quiz={quiz} onComplete={onComplete} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h3 className="text-xl font-bold text-slate-800 mb-6">اختر البحر الشعري للاختبار:</h3>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CLASSICAL_METERS.map((meter) => (
          <button
            key={meter.name}
            onClick={() => handleMeterSelect(meter)}
            className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          >
            <span className="block text-lg font-amiri font-bold text-slate-700 group-hover:text-emerald-800">{meter.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">اختبار تخصصي</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MeterSpecificQuiz;
