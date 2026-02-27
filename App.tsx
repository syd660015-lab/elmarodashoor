import React, { useState, useEffect } from 'react';
import { analyzeVerse } from './services/geminiService';
import { ProsodyAnalysis, HistoryItem, StudentStats } from './types';
import Visualizer from './components/Visualizer';
import AssessmentEngine from './components/AssessmentEngine';
import HistoryPanel from './components/HistoryPanel';
import LearningDashboard from './components/LearningDashboard';
import KnowledgeBase from './components/KnowledgeBase';
import StandaloneQuiz from './components/StandaloneQuiz';
import MeterSpecificQuiz from './components/MeterSpecificQuiz';
import FoundationQuiz from './components/FoundationQuiz';
import ComprehensiveQuiz from './components/ComprehensiveQuiz';

type ViewState = 'analyzer' | 'dashboard' | 'knowledge' | 'quiz';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('analyzer');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProsodyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const [quizTab, setQuizTab] = useState<'general' | 'meter' | 'foundation' | 'comprehensive'>('foundation');
  
  // Manual Input States
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSymbols, setManualSymbols] = useState('');

  const [stats, setStats] = useState<StudentStats>({
    interactionsCount: 0,
    strengths: [],
    recurringErrors: [],
    completedQuizzes: 0,
    averageScore: 0,
    meterCounts: {}
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('mizan_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    const savedStats = localStorage.getItem('mizan_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('mizan_history', JSON.stringify(history));
    localStorage.setItem('mizan_stats', JSON.stringify(stats));
  }, [history, stats]);

  const handleAnalyze = async () => {
    if (!verse.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowAssessment(false);
    setSaveStatus(false);
    try {
      const analysis = await analyzeVerse(verse);
      setResult(analysis);
      
      const newItem: HistoryItem = {
        ...analysis,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      if (!history.find(h => h.original === analysis.original)) {
        setHistory(prev => [newItem, ...prev].slice(0, 20));
      }

      setStats(prev => ({
        ...prev,
        interactionsCount: prev.interactionsCount + 1,
        meterCounts: {
          ...prev.meterCounts,
          [analysis.meterName]: (prev.meterCounts[analysis.meterName] || 0) + 1
        }
      }));

      if (isManualMode && manualSymbols) {
        setShowAssessment(true);
        // We'll pass the symbols to AssessmentEngine via a prop
      }

    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setError('لقد تجاوزت حصة الاستخدام المتاحة. يرجى محاولة تغيير مفتاح API الخاص بك من أسفل الصفحة.');
      } else if (err.message?.includes('Requested entity was not found')) {
        setError('انتهت صلاحية جلسة مفتاح API أو أن المفتاح غير صالح. يرجى إعادة اختيار المفتاح.');
        setHasKey(false);
      } else {
        setError(err.message || 'حدث خطأ في محرك الميزان');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLocalStorage = () => {
    if (!result) return;
    
    const savedVersesKey = 'mizan_saved_verses';
    const existingSaved = localStorage.getItem(savedVersesKey);
    const savedList: HistoryItem[] = existingSaved ? JSON.parse(existingSaved) : [];
    
    const newItem: HistoryItem = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    savedList.push(newItem);
    localStorage.setItem(savedVersesKey, JSON.stringify(savedList));
    
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item);
    setVerse(item.original);
    setShowAssessment(false);
    setShowHistory(false);
    setSaveStatus(false);
    setActiveView('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addManualSymbol = (s: string) => {
    setManualSymbols(prev => prev + s);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    setStats(prev => {
      const newTotalQuizzes = prev.completedQuizzes + 1;
      const newAverageScore = (prev.averageScore * prev.completedQuizzes + percentage) / newTotalQuizzes;
      return {
        ...prev,
        completedQuizzes: newTotalQuizzes,
        averageScore: newAverageScore
      };
    });
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf7] font-Tajawal p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-900 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8 transform -rotate-3">
            <span className="text-4xl font-amiri text-white font-bold">م</span>
          </div>
          <h1 className="text-3xl font-amiri font-bold text-emerald-900 mb-4">مرحباً بك في ميزان</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            للبدء في استخدام ميزات الذكاء الاصطناعي المتقدمة، يرجى اختيار مفتاح API الخاص بك. هذا يضمن استمرارية الخدمة وتجنب حدود الاستخدام المجاني.
          </p>
          <button
            onClick={handleOpenKeySelector}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all mb-4"
          >
            إعداد مفتاح API
          </button>
          <p className="text-xs text-slate-400">
            يمكنك الحصول على مفتاح من <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">توثيق الفوترة</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 text-slate-900 bg-[#fcfbf7] font-Tajawal">
      <div className="h-2 bg-gradient-to-l from-emerald-800 via-emerald-600 to-emerald-800 w-full"></div>

      <header className="bg-white py-8 px-6 shadow-sm relative overflow-hidden border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <span className="text-3xl font-amiri text-white font-bold">م</span>
            </div>
            <div>
              <h1 className="text-4xl font-amiri font-bold text-emerald-900 tracking-tight">ميزان الذكي</h1>
              <p className="text-slate-500 font-medium">نظام التقطيع الإيقاعي والتقويم التربوي</p>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setActiveView('analyzer')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeView === 'analyzer' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-emerald-800'}`}
            >
              المختبر العروضي
            </button>
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeView === 'dashboard' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-emerald-800'}`}
            >
              لوحة المهارات
            </button>
            <button 
              onClick={() => setActiveView('knowledge')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeView === 'knowledge' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-emerald-800'}`}
            >
              موسوعة البحور
            </button>
            <button 
              onClick={() => setActiveView('quiz')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeView === 'quiz' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-emerald-800'}`}
            >
              إختبار المهارات
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-12 relative z-10">
        
        {activeView === 'analyzer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm">1</span>
                    المحلل الإيقاعي الذكي
                  </h3>
                  
                  <button 
                    onClick={() => setIsManualMode(!isManualMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2
                      ${isManualMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${isManualMode ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    وضع التحدي الذاتي
                  </button>
                </div>

                {showHistory ? (
                  <div className="animate-in fade-in zoom-in-95">
                    <HistoryPanel 
                      history={history} 
                      onSelect={handleSelectHistory} 
                      onDelete={(id) => setHistory(h => h.filter(i => i.id !== id))}
                      onClear={() => setHistory([])}
                    />
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="w-full mt-6 py-3 text-emerald-700 font-bold bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      العودة للمختبر
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative group">
                      <textarea
                        className="w-full h-44 p-8 text-5xl font-amiri leading-relaxed bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center resize-none shadow-inner outline-none"
                        placeholder="اكتب البيت الشعري هنا..."
                        value={verse}
                        onChange={(e) => setVerse(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {isManualMode && (
                      <div className="mt-6 p-6 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-100 animate-in slide-in-from-top-4">
                        <p className="text-center text-indigo-900 font-bold mb-4">أدخل تقطيعك الرمزي للبيت (اختياري):</p>
                        <div className="flex flex-col gap-4">
                          <input
                            type="text"
                            dir="ltr"
                            className="w-full p-4 text-3xl font-mono tracking-widest text-center bg-white border-2 border-indigo-100 rounded-2xl focus:border-indigo-400 outline-none transition-all"
                            placeholder="/0/0/..."
                            value={manualSymbols}
                            onChange={(e) => setManualSymbols(e.target.value.replace(/[^/0]/g, ''))}
                          />
                          <div className="flex justify-center gap-3">
                            <button onClick={() => addManualSymbol('/')} className="w-16 h-12 bg-white text-indigo-600 font-bold rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50">/</button>
                            <button onClick={() => addManualSymbol('0')} className="w-16 h-12 bg-white text-indigo-600 font-bold rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50">0</button>
                            <button onClick={() => setManualSymbols('')} className="px-4 h-12 bg-white text-red-400 font-bold rounded-xl shadow-sm border border-red-50 hover:bg-red-50">مسح</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={handleAnalyze}
                        disabled={loading || !verse.trim()}
                        className={`flex-1 py-4 text-xl font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3
                          ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
                      >
                        {loading ? 'جاري التحليل...' : isManualMode ? 'تحليل وتدقيق إجابتي' : 'بدء التحليل الرقمي'}
                      </button>
                      
                      <button 
                        onClick={() => setShowHistory(true)}
                        className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200"
                        title="سجل التحليلات"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {error && <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 text-center font-bold">{error}</div>}

              {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-amber-50 rounded-3xl p-10 border border-amber-200 text-center shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                    <span className="text-amber-800 font-bold uppercase tracking-[0.2em] text-xs block mb-2 opacity-60">Result Identified</span>
                    <h2 className="text-8xl font-amiri font-bold text-amber-900 drop-shadow-sm">{result.meterName}</h2>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setShowAssessment(!showAssessment)}
                        className={`px-8 py-3.5 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 focus:ring-4 focus:ring-indigo-500/50 focus:outline-none
                          ${showAssessment ? 'bg-slate-800 text-white ring-4 ring-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                      >
                        {showAssessment ? 'إغلاق نافذة الاختبار' : 'بدء تقويم المهارات والمعارف'}
                      </button>

                      <div className="relative inline-block">
                        <button 
                          onClick={handleSaveToLocalStorage}
                          className={`px-8 py-3.5 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-3 transform hover:scale-105 focus:ring-4 focus:ring-slate-300 focus:outline-none relative z-10
                            ${saveStatus ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
                        >
                          {saveStatus ? 'تم الحفظ!' : 'حفظ التحليل'}
                        </button>
                        
                        {saveStatus && (
                          <>
                            <div className="absolute inset-0 bg-emerald-400 rounded-2xl animate-ping opacity-25 z-0"></div>
                            <div className="absolute inset-0 pointer-events-none z-20">
                              {[...Array(8)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className="absolute text-xl animate-bounce"
                                  style={{
                                    top: `-${Math.random() * 60 + 30}px`,
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 100}ms`,
                                    opacity: 1
                                  }}
                                >
                                  {['✨', '🎉', '🌟', '🎊'][i % 4]}
                                </span>
                              ))}
                            </div>
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out z-20">
                              <span className="bg-emerald-900 text-white text-[11px] font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-emerald-400/30">
                                <span>🎉</span> عمل رائع! تمت الإضافة لمجموعتك
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {showAssessment && (
                    <div id="assessment-section">
                      <AssessmentEngine 
                        analysis={result} 
                        initialManualSymbols={isManualMode ? manualSymbols : ''}
                        onQuizComplete={handleQuizComplete}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest border-b pb-2">النص المشكول</h4>
                      <p className="text-5xl font-amiri leading-relaxed text-slate-800 text-center">{result.diacritized}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest border-b pb-2">الكتابة العروضية</h4>
                      <p className="text-5xl font-amiri leading-relaxed text-emerald-800 text-center">{result.prosodicWriting}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest border-b pb-2 text-center">التوقيع الإيقاعي الرقمي</h4>
                    <Visualizer symbols={result.symbols} />
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-widest border-b pb-2 text-center">مصفوفة التفاعيل</h4>
                    <div className="flex flex-wrap gap-6 justify-center">
                      {result.tafilat.map((taf, idx) => (
                        <div key={idx} className="group relative flex flex-col items-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-2">
                          <span className="text-3xl font-amiri text-slate-800 mb-3">{taf.text}</span>
                          <span className="text-sm font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200" dir="ltr">{taf.pattern}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.explanation && (
                    <div className="bg-emerald-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-3">التعليق البيداغوجي</h3>
                      <p className="leading-loose text-emerald-50 text-xl font-medium font-Tajawal italic">"{result.explanation}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">نظرة سريعة</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">التحليلات اليوم</span>
                    <span className="font-bold text-emerald-700">{stats.interactionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الاختبارات</span>
                    <span className="font-bold text-blue-700">{stats.completedQuizzes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">دقة الاختبارات</span>
                    <span className="font-bold text-indigo-600">{Math.round(stats.averageScore)}%</span>
                  </div>
                  
                  {Object.keys(stats.meterCounts || {}).length > 0 && (
                    <div className="pt-4 border-t border-slate-50">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">توزيع البحور</h5>
                      <div className="space-y-3">
                        {Object.entries(stats.meterCounts)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 font-medium">{name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-400" 
                                    style={{ width: `${((count as number) / stats.interactionsCount) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-slate-400 w-4 text-left">{count as number}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-slate-100"></div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يستخدم ميزان خوارزميات الذكاء الاصطناعي لتقسيم التفاعيل بناءً على نطق الكلمة وليس رسمها الإملائي.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'dashboard' && <LearningDashboard stats={stats} />}
        {activeView === 'knowledge' && <KnowledgeBase />}
        
        {activeView === 'quiz' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-amiri font-bold text-slate-800">إختبار المهارات العروضية</h2>
                    <p className="text-slate-500">اختبر معلوماتك في علم العروض</p>
                  </div>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
                  <button 
                    onClick={() => setQuizTab('foundation')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${quizTab === 'foundation' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    اختبار المفاهيم
                  </button>
                  <button 
                    onClick={() => setQuizTab('comprehensive')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${quizTab === 'comprehensive' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    الاختبار الشامل
                  </button>
                  <button 
                    onClick={() => setQuizTab('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${quizTab === 'general' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    اختبار ذكي (AI)
                  </button>
                  <button 
                    onClick={() => setQuizTab('meter')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${quizTab === 'meter' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    اختبار بحر (AI)
                  </button>
                </div>
              </div>
              
              {quizTab === 'foundation' && (
                <FoundationQuiz onComplete={handleQuizComplete} />
              )}
              
              {quizTab === 'comprehensive' && (
                <ComprehensiveQuiz onComplete={handleQuizComplete} />
              )}
              
              {quizTab === 'general' && (
                <StandaloneQuiz onComplete={handleQuizComplete} />
              )}
              
              {quizTab === 'meter' && (
                <MeterSpecificQuiz onComplete={handleQuizComplete} />
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="mt-20 py-12 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-emerald-900 font-bold text-2xl mb-3 font-amiri">
            تصميم وبرمجة: دكتور. أحمد حمدي عاشور الغول
          </p>
          <div className="flex justify-center items-center gap-4 text-slate-400 text-sm font-medium mb-4">
            <span className="text-slate-600 font-bold">ميزان الإيقاع الشعري الذكي</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>© {new Date().getFullYear()}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <button 
              onClick={handleOpenKeySelector}
              className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
            >
              تغيير مفتاح API
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;