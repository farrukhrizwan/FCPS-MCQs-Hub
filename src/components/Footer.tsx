import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 px-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/fcps_logo.svg" alt="FCPS Logo" className="w-5 h-5 object-contain" />
          <p className="font-semibold text-slate-700 text-xs">
            © 2026 <span className="text-slate-900 font-bold">Farrukh Barlas</span> & <span className="text-slate-900 font-bold">Afu webs</span> • <span className="text-indigo-900 font-bold">Created for FCPS&C</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Middle Section</span>
          <span>•</span>
          <span>SSC 9th & 10th</span>
          <span>•</span>
          <span>GK & IQ</span>
        </div>
      </div>
    </footer>
  );
};
