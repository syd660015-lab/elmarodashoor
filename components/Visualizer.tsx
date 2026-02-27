import React from 'react';

interface VisualizerProps {
  symbols: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ symbols }) => {
  const segments = symbols.split('');

  const getLabel = (s: string) => {
    if (s === '/') return 'حركة (Harakah)';
    if (s === '0') return 'سكون (Sukun)';
    return '';
  };

  const getArabicLabel = (s: string) => {
    if (s === '/') return 'حركة';
    if (s === '0') return 'سكون';
    return '';
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center py-8 px-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-inner" dir="ltr">
      {segments.map((s, i) => (
        <div 
          key={i} 
          className="group relative flex flex-col items-center"
        >
          {/* Tooltip */}
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 origin-bottom bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-30 pointer-events-none shadow-xl border border-white/10 font-Tajawal">
            {getArabicLabel(s)}
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>

          {/* Symbol Box */}
          <div 
            className={`w-10 h-12 flex items-center justify-center text-3xl font-bold rounded-xl shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md
              ${s === '/' 
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-200' 
                : 'bg-blue-100 text-blue-800 border-2 border-blue-200'}`}
            role="img"
            aria-label={getLabel(s)}
          >
            {s}
          </div>
          
          {/* Small label indicator underneath for always-on visual context if needed, 
              but since user requested tooltip on hover, the absolute div above handles it. */}
        </div>
      ))}
    </div>
  );
};

export default Visualizer;