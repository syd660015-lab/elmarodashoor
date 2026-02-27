import React from 'react';
import { StudentStats, ArudSkill } from '../types';
import { CLASSICAL_METERS, ARUD_SKILLS } from '../data/arudData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';

interface LearningDashboardProps {
  stats: StudentStats;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({ stats }) => {
  // Logic to determine skill status based on stats
  const getSkillStatus = (skillId: string) => {
    const hasErrors = stats.recurringErrors.length > 0;
    const hasStrengths = stats.strengths.length > 0;
    const highAccuracy = stats.averageScore > 80;

    switch (skillId) {
      case 'S1':
      case 'S2':
        return highAccuracy && stats.interactionsCount > 5 
          ? { label: 'كفاية مكتسبة', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✓', border: 'border-emerald-200' }
          : { label: 'قيد الممارسة', color: 'text-blue-600', bg: 'bg-blue-50', icon: '•', border: 'border-blue-200' };
      
      case 'S3':
      case 'S5':
        return hasStrengths 
          ? { label: 'نقطة قوة', color: 'text-amber-600', bg: 'bg-amber-50', icon: '★', border: 'border-amber-200' }
          : { label: 'قيد التعلم', color: 'text-slate-500', bg: 'bg-slate-50', icon: '○', border: 'border-slate-200' };
      
      case 'S4':
        return hasErrors 
          ? { label: 'تتطلب تركيزاً', color: 'text-red-600', bg: 'bg-red-50', icon: '!', border: 'border-red-200' }
          : { label: 'جاهزية عالية', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✓', border: 'border-emerald-200' };
      
      default:
        return { label: 'قيد المعالجة', color: 'text-slate-400', bg: 'bg-slate-50', icon: '?', border: 'border-slate-100' };
    }
  };

  // Prepare data for charts
  const errorData = stats.recurringErrors.map(e => ({
    name: e.meterName,
    count: e.errorCount
  }));

  const meterDistributionData = Object.entries(stats.meterCounts || {}).map(([name, count]) => ({
    name,
    value: count
  }));

  const radarData = CLASSICAL_METERS.slice(0, 6).map(m => ({
    subject: m.name,
    A: stats.meterCounts[m.name] || 0,
    fullMark: Math.max(...(Object.values(stats.meterCounts) as number[]), 5)
  }));

  const trendData = [
    { name: '1', score: 40 },
    { name: '2', score: 30 },
    { name: '3', score: 65 },
    { name: '4', score: 45 },
    { name: '5', score: 80 },
    { name: '6', score: stats.averageScore },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const strengthData = stats.strengths.map(s => ({
    name: s,
    count: (stats.meterCounts[s] || 0) as number
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      
      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <span className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest">إجمالي التفاعلات</span>
          <span className="text-5xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">{stats.interactionsCount}</span>
          <div className="mt-4 w-full h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <Area type="monotone" dataKey="score" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <span className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest">الاختبارات المنجزة</span>
          <span className="text-5xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{stats.completedQuizzes}</span>
          <div className="mt-4 flex gap-1 h-12 items-end w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-5)}>
                <Bar dataKey="score" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <span className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest">نسبة الإتقان</span>
          <span className="text-5xl font-bold text-amber-600 group-hover:scale-110 transition-transform">{Math.round(stats.averageScore)}%</span>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-amber-400 h-full transition-all duration-1000" style={{width: `${stats.averageScore}%`}}></div>
          </div>
        </div>
        <div className="bg-emerald-900 p-8 rounded-[2rem] shadow-lg flex flex-col items-center justify-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-emerald-400 text-xs font-bold mb-4 uppercase tracking-widest">الرتبة العروضية</span>
          <span className="text-3xl font-bold group-hover:scale-105 transition-transform text-center">متذوق ناشئ</span>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest">مستوى متقدم قريب</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Errors Chart Section */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              توزيع التعثرات الإيقاعية
            </h3>
          </div>
          
          {stats.recurringErrors.length > 0 ? (
            <div className="space-y-8">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'Amiri' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                  نصيحة: يظهر الرسم البياني تركيز الأخطاء في بحر {stats.recurringErrors.sort((a,b) => b.errorCount - a.errorCount)[0].meterName}. يُنصح بمراجعة مفاتيح هذا البحر وزحافاته.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">سجلك خالٍ من الأخطاء المتكررة حالياً</p>
            </div>
          )}
        </div>

        {/* Strengths Chart Section */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              مؤشر نقاط القوة
            </h3>
          </div>
          
          {stats.strengths.length > 0 ? (
            <div className="space-y-8">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600, fontFamily: 'Amiri' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  أداء متميز: تظهر نقاط قوتك بوضوح في بحر {stats.strengths[0]}. استمر في تعزيز هذا الإتقان.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">سيتم تحديد نقاط قوتك بعد المزيد من التحليلات</p>
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart for Proficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            بصمة الإتقان العروضي
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 14, fontFamily: 'Amiri', fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            تقدم البحور
          </h3>
          <div className="space-y-6 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {CLASSICAL_METERS.map(meter => {
              const count = (stats.meterCounts[meter.name] || 0) as number;
              const progress = Math.min((count / 5) * 100, 100);
              return (
                <div key={meter.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700 font-amiri">{meter.name}</span>
                    <span className="text-slate-400 text-xs">{count}/5</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          مصفوفة الكفايات العروضية الذكية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARUD_SKILLS.map((skill, idx) => {
            const status = getSkillStatus(skill.id);
            const isRelatedToError = skill.id === 'S4' && stats.recurringErrors.length > 0;
            const isRelatedToStrength = skill.id === 'S5' && stats.strengths.length > 0;

            return (
              <div 
                key={skill.id} 
                className={`group p-8 border-2 rounded-[2rem] transition-all hover:shadow-xl hover:shadow-indigo-900/5 relative overflow-hidden
                  ${status.bg} ${status.border} ${isRelatedToError ? 'ring-2 ring-red-400 ring-offset-4' : ''} ${isRelatedToStrength ? 'ring-2 ring-emerald-400 ring-offset-4' : ''}`}
              >
                {isRelatedToError && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    مرتبط بالأخطاء المتكررة
                  </div>
                )}
                {isRelatedToStrength && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    مرتبط بنقاط القوة
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-slate-100">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-bold text-lg">{skill.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white shadow-sm border border-slate-100
                          ${skill.difficulty === 'مبتدئ' ? 'text-blue-500' : 
                            skill.difficulty === 'متوسط' ? 'text-amber-500' : 'text-purple-500'}`}>
                          {skill.difficulty}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${status.color}`}>
                          <span>{status.icon}</span>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">معدل الإتقان التراكمي</span>
                    <span className={status.color}>{Math.round(stats.averageScore)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${status.color.replace('text-', 'bg-')}`} 
                      style={{ width: `${stats.averageScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/40">
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    {skill.id === 'S4' && stats.recurringErrors.length > 0 
                      ? "• يتأثر هذا التقييم بتعثرك الأخير في بحر " + stats.recurringErrors[0].meterName
                      : skill.id === 'S5' && stats.strengths.length > 0
                      ? "• تمكنك من بحر " + stats.strengths[0] + " ساهم في رفع رصيد هذه الكفاية"
                      : "• استمر في ممارسة التقطيع اليدوي لتعزيز هذه الكفاية التأسيسية"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
