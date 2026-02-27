
import React from 'react';
import { CLASSICAL_METERS } from '../data/arudData';

const KnowledgeBase: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-700">البحر</th>
              <th className="p-4 font-bold text-slate-700">التفاعيل الأصلية</th>
              <th className="p-4 font-bold text-slate-700">أهم الزحافات والعلل</th>
            </tr>
          </thead>
          <tbody>
            {CLASSICAL_METERS.map((meter, idx) => (
              <tr key={idx} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                <td className="p-4 font-amiri text-xl font-bold text-emerald-900">{meter.name}</td>
                <td className="p-4 font-amiri text-lg text-slate-700">{meter.originalTafilat}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {meter.acceptedZihafat.concat(meter.acceptedIlal).map((rule, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                        {rule}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-400 text-center italic">
        * البيانات أعلاه مستمدة من قواعد الخليل بن أحمد الفراهيدي ومنقحة بيداغوجياً.
      </p>
    </div>
  );
};

export default KnowledgeBase;
