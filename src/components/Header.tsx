import React from 'react';
import { Shield, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  studentName?: string;
  studentClass?: string;
  isLoggedIn?: boolean;
  onResetToHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  studentName,
  studentClass,
  isLoggedIn,
  onResetToHome,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo & Academic Title */}
        <div 
          onClick={onResetToHome}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition-opacity"
        >
          <img 
            src="/fcps_logo.svg" 
            alt="FCPS Logo" 
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform" 
          />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <span>FCPS MCQs Hub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-950 border border-indigo-300 hidden sm:inline-block">
                FCPS&C
              </span>
            </h1>
            <p className="text-[11px] text-indigo-900 font-extrabold tracking-wide">
              Your Gateway to Exam Readiness
            </p>
          </div>
        </div>

        {/* User Status & Admin Access */}
        <div className="flex items-center gap-3">
          {studentName ? (
            <div className="hidden sm:flex flex-col items-end text-xs pr-2 border-r border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-800" />
                {studentName}
              </span>
              <span className="text-slate-500 text-[11px] font-medium">
                {studentClass} {isLoggedIn ? '• OTP Verified' : '• Practice'}
              </span>
            </div>
          ) : (
            <div className="hidden md:block text-right pr-2 border-r border-slate-200">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal</span>
              <span className="text-xs font-bold text-indigo-950">FCPS Academic Systems</span>
            </div>
          )}

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs cursor-pointer"
            title="School Admin Access"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden xs:inline">Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
