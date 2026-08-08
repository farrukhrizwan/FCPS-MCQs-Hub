import React, { useState, useEffect } from 'react';
import { Subject, SpecialTestConfig, ClassOtpConfig, MCQQuestion, SystemClass } from '../types';
import {
  BookOpen,
  CheckSquare,
  Square,
  Key,
  ShieldCheck,
  PlayCircle,
  Award,
  Sparkles,
  AlertCircle,
  Clock,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface SubjectSelectorProps {
  questionBank: Subject[];
  specialTestConfig: SpecialTestConfig | null;
  classOtps: ClassOtpConfig;
  classesList?: SystemClass[];
  onStartStandardTest: (config: {
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    selectedSubject: Subject;
    selectedChapterIds: number[];
    isCompleteBook: boolean;
  }) => void;
  onStartGkIqTest: (config: {
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    topics: ('gk' | 'iq')[];
    questionCount: number;
  }) => void;
  onStartSpecialTest: (config: {
    studentName: string;
    studentClass: string;
    otp: string;
    specialTest: SpecialTestConfig;
  }) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  questionBank,
  specialTestConfig,
  classOtps,
  onStartStandardTest,
  onStartGkIqTest,
  onStartSpecialTest,
}) => {
  // Student Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('9th Class');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');

  // Active Subject & Chapter Selection
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
  const [isCompleteBook, setIsCompleteBook] = useState<boolean>(true);

  // Featured GK & IQ Topic Selection Modal State
  const [isGkIqModalOpen, setIsGkIqModalOpen] = useState<boolean>(false);
  const [selectGk, setSelectGk] = useState<boolean>(true);
  const [selectIq, setSelectIq] = useState<boolean>(true);

  // Special Test OTP Prompt Modal State
  const [isSpecialTestOtpModalOpen, setIsSpecialTestOtpModalOpen] = useState<boolean>(false);
  const [specialTestOtpInput, setSpecialTestOtpInput] = useState<string>('');
  const [specialTestOtpError, setSpecialTestOtpError] = useState<string>('');

  // Section Accordion State
  const [openSection, setOpenSection] = useState<'middle' | 'ssc9' | 'ssc10' | 'gk_iq' | null>('ssc9');

  // Countdown Timer for Special Test
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    if (!specialTestConfig || !specialTestConfig.isActive) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(specialTestConfig.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeftStr('TEST TIME EXPIRED');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [specialTestConfig]);

  // Helper to verify OTP according to selected class
  const verifyStudentOtp = (): boolean => {
    setOtpError('');
    if (!isLoggedIn) return true;

    if (!studentName.trim()) {
      setOtpError('Please enter your Student Full Name before starting.');
      return false;
    }

    if (!otpInput.trim()) {
      setOtpError('Please enter the 6-digit OTP provided by your School Admin.');
      return false;
    }

    // Determine expected OTP based on studentClass
    let expectedOtp = classOtps.ssc9Otp;
    if (studentClass.includes('Middle')) {
      expectedOtp = classOtps.middleOtp;
    } else if (studentClass.includes('10th')) {
      expectedOtp = classOtps.ssc10Otp;
    }

    if (otpInput.trim() !== expectedOtp.trim()) {
      setOtpError(`Invalid OTP Code for ${studentClass}. Please check with your school administrator.`);
      return false;
    }

    return true;
  };

  const handleStartSubjectProceed = (subject: Subject) => {
    if (!verifyStudentOtp()) return;

    setSelectedSubject(subject);
    if (!subject.hasChapters) {
      onStartStandardTest({
        studentName: studentName.trim() || 'Guest Student',
        studentClass,
        isLoggedIn,
        otp: otpInput.trim(),
        selectedSubject: subject,
        selectedChapterIds: [],
        isCompleteBook: true,
      });
    } else {
      setSelectedChapterIds(subject.chapters.map((ch) => ch.id));
      setIsCompleteBook(true);
    }
  };

  const toggleChapter = (chapterId: number) => {
    if (isCompleteBook) {
      setIsCompleteBook(false);
      setSelectedChapterIds([chapterId]);
    } else {
      if (selectedChapterIds.includes(chapterId)) {
        const updated = selectedChapterIds.filter((id) => id !== chapterId);
        if (updated.length === 0) {
          setIsCompleteBook(true);
          setSelectedChapterIds(selectedSubject ? selectedSubject.chapters.map((ch) => ch.id) : []);
        } else {
          setSelectedChapterIds(updated);
        }
      } else {
        const updated = [...selectedChapterIds, chapterId];
        if (selectedSubject && updated.length === selectedSubject.chapters.length) {
          setIsCompleteBook(true);
        }
        setSelectedChapterIds(updated);
      }
    }
  };

  const toggleCompleteBook = () => {
    if (!selectedSubject) return;
    if (isCompleteBook) {
      setIsCompleteBook(false);
      setSelectedChapterIds([]);
    } else {
      setIsCompleteBook(true);
      setSelectedChapterIds(selectedSubject.chapters.map((ch) => ch.id));
    }
  };

  const handleConfirmStartChapterTest = () => {
    if (!selectedSubject) return;

    if (selectedSubject.hasChapters && !isCompleteBook && selectedChapterIds.length === 0) {
      setOtpError('Please select at least one chapter or check "Complete Book".');
      return;
    }

    onStartStandardTest({
      studentName: studentName.trim() || 'Practice Student',
      studentClass,
      isLoggedIn,
      otp: otpInput.trim(),
      selectedSubject,
      selectedChapterIds: isCompleteBook ? selectedSubject.chapters.map((ch) => ch.id) : selectedChapterIds,
      isCompleteBook,
    });
  };

  // Launch Featured GK & IQ
  const handleLaunchGkIqTest = () => {
    if (!verifyStudentOtp()) return;
    if (!selectGk && !selectIq) {
      alert('Please select at least one topic (General Knowledge or IQ).');
      return;
    }

    const topics: ('gk' | 'iq')[] = [];
    if (selectGk) topics.push('gk');
    if (selectIq) topics.push('iq');

    const totalQuestions = topics.length === 2 ? 30 : 20;

    setIsGkIqModalOpen(false);
    onStartGkIqTest({
      studentName: studentName.trim() || 'Student',
      studentClass,
      isLoggedIn,
      otp: otpInput.trim(),
      topics,
      questionCount: totalQuestions
    });
  };

  // Launch Special Test
  const handleVerifyAndStartSpecialTest = () => {
    setSpecialTestOtpError('');

    if (!isLoggedIn) {
      setSpecialTestOtpError('Guest users are strictly blocked. Please enter Student Full Name and login.');
      return;
    }

    if (!studentName.trim()) {
      setSpecialTestOtpError('Please enter Student Full Name.');
      return;
    }

    if (!specialTestConfig || !specialTestConfig.isActive) {
      setSpecialTestOtpError('No active Special TEST currently scheduled.');
      return;
    }

    if (specialTestOtpInput.trim() !== specialTestConfig.otpCode.trim()) {
      setSpecialTestOtpError('Invalid 6-digit Special TEST Passcode / OTP. Access Denied.');
      return;
    }

    setIsSpecialTestOtpModalOpen(false);
    onStartSpecialTest({
      studentName: studentName.trim(),
      studentClass,
      otp: specialTestOtpInput.trim(),
      specialTest: specialTestConfig
    });
  };

  const middleSubjects = questionBank.filter((s) => s.category === 'middle');
  const ssc9Subjects = questionBank.filter((s) => s.category === 'ssc9');
  const ssc10Subjects = questionBank.filter((s) => s.category === 'ssc10');
  const gkIqSubjects = questionBank.filter((s) => s.category === 'gk_iq');

  const isSpecialTestActive = Boolean(specialTestConfig && specialTestConfig.isActive);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ======================================================== */}
      {/* 1. SPECIAL ANNOUNCED TEST BANNER (DYNAMIC STATES A & B) */}
      {/* ======================================================== */}
      {isSpecialTestActive && specialTestConfig ? (
        /* STATE A: TEST ACTIVE (Solid Black theme, Vivid Red animated header) */
        <div className="bg-black rounded-2xl p-5 sm:p-6 text-white shadow-2xl border-2 border-red-500 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-red-600 font-black uppercase text-[11px] tracking-widest animate-pulse bg-white px-3 py-1 rounded-md shadow-sm">
                  🚨 OFFICIAL SPECIAL CLASS TEST ANNOUNCED
                </span>
                <span className="text-xs font-mono font-bold bg-zinc-900 px-2.5 py-1 rounded text-zinc-300 border border-zinc-800">
                  Target: {specialTestConfig.targetClass}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
                <Zap className="w-6 h-6 text-red-500 animate-bounce" />
                <span>{specialTestConfig.targetClass} • {specialTestConfig.title}</span>
              </h2>

              <p className="text-xs text-zinc-300 font-medium">
                Subject: <strong className="text-white">{specialTestConfig.subjectName}</strong> • Questions:{' '}
                <strong className="text-red-400">{specialTestConfig.questions ? specialTestConfig.questions.length : 0} Items</strong>
              </p>

              {timeLeftStr && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold bg-zinc-900/90 px-3 py-1.5 rounded-lg w-fit text-red-400 border border-red-900/50">
                  <Clock className="w-4 h-4 text-red-500 animate-spin-slow" />
                  <span>Time Remaining: {timeLeftStr}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSpecialTestOtpError('');
                setIsSpecialTestOtpModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider px-6 py-3.5 rounded-xl text-xs shadow-lg transition-all shrink-0 cursor-pointer flex items-center gap-2 border border-red-400"
            >
              <Lock className="w-4 h-4" />
              <span>START SPECIAL TEST (OTP REQUIRED) →</span>
            </button>
          </div>
        </div>
      ) : (
        /* STATE B: NO TEST ACTIVE (Smooth Encouraging Green Theme) */
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border-2 border-emerald-400 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-900 font-black uppercase text-[10px] tracking-widest bg-emerald-100 px-3 py-1 rounded-md shadow-xs">
                  ✅ CLASS TEST STATUS
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                <span>No Test Announced</span>
              </h2>

              <p className="text-xs text-emerald-100 font-medium">
                Target: 9th Class • FCPS ANNUAL BOARD PREPARATION SPECIAL TEST
              </p>

              <p className="text-xs text-emerald-200 font-semibold">
                Subject: Mathematics & Physics • Questions: 0 Items
              </p>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2.5 rounded-xl text-xs text-emerald-100 font-bold shrink-0">
              All Class Tests Up-To-Date
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CLASS TEST STATUS CARD LINK BUTTON */}
      {/* ======================================================== */}
      <div
        className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
          isSpecialTestActive
            ? 'bg-amber-50/90 border-amber-400 animate-flash-amber'
            : 'bg-emerald-50/80 border-emerald-300'
        }`}
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              isSpecialTestActive ? 'bg-amber-600' : 'bg-emerald-700'
            }`}
          >
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-sm font-black uppercase tracking-tight ${
                isSpecialTestActive ? 'text-amber-950' : 'text-emerald-950'
              }`}
            >
              CLASS TEST STATUS
            </h3>
            <p
              className={`text-xs font-medium ${
                isSpecialTestActive ? 'text-amber-900 font-bold' : 'text-emerald-800'
              }`}
            >
              {isSpecialTestActive
                ? `Active Special Test Announced for ${specialTestConfig?.targetClass}`
                : 'No Special Test active. Standard practice testing enabled.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isSpecialTestActive) {
              setIsSpecialTestOtpModalOpen(true);
            } else {
              alert('No Special Class Test is currently scheduled by admin.');
            }
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
            isSpecialTestActive
              ? 'bg-amber-600 hover:bg-amber-700 text-slate-950 shadow-xs font-black'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
          }`}
        >
          {isSpecialTestActive ? 'Enter Special Class Test →' : 'Class Test Info'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. STUDENT AUTHENTICATION & MODE CARD */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-white border-b border-slate-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">Student Login & Class Selection</h2>
              <p className="text-xs text-slate-500 font-medium">Select your grade and enter student credentials</p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-950 border border-indigo-200">
            {isLoggedIn ? 'Official Verified Mode' : 'Guest Practice Mode'}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-4 bg-white">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setOtpError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isLoggedIn
                  ? 'bg-white text-indigo-950 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isLoggedIn ? 'text-indigo-800' : ''}`} />
              <span>Verified Test (With OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                setOtpError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                !isLoggedIn
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PlayCircle className={`w-4 h-4 ${!isLoggedIn ? 'text-indigo-800' : ''}`} />
              <span>Practice Mode (Unsaved)</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Student Full Name {isLoggedIn && <span className="text-indigo-700">*</span>}
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-800 focus:ring-1 focus:ring-indigo-800 text-slate-900 placeholder-slate-400 font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Class / Grade Section</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-800 focus:ring-1 focus:ring-indigo-800 text-slate-900 font-semibold transition-all"
              >
                <option value="Middle Section (Class 6-8)">Middle Section (Class 6-8)</option>
                <option value="9th Class">SSC Part 1 (9th Class)</option>
                <option value="10th Class">SSC Part 2 (10th Class)</option>
                <option value="General Knowledge & IQ">General Knowledge & IQ</option>
              </select>
            </div>
          </div>

          {isLoggedIn && (
            <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Class 6-digit OTP Passcode <span className="text-indigo-800">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 6-digit OTP passcode"
                  className="flex-1 px-3.5 py-2 text-sm font-mono tracking-wider font-bold bg-white border border-indigo-300 rounded-md text-indigo-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                />
              </div>
              <p className="text-[11px] text-indigo-900 font-semibold">
                🔒 Verified test results compile into official FCPS student performance reports.
              </p>
            </div>
          )}

          {otpError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-800" />
              <span>{otpError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. CHAPTER SELECTION MODAL (When a standard subject is picked) */}
      {/* ======================================================== */}
      {selectedSubject && selectedSubject.hasChapters && (
        <div className="bg-white rounded-xl border-2 border-indigo-800 shadow-sm p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-800">
                Chapter Configuration
              </span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{selectedSubject.name}</h3>
            </div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              ← Back to Subjects
            </button>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Select specific chapters or choose <strong>Complete Book</strong> for a full evaluation.
          </p>

          {/* Complete Book Option */}
          <button
            type="button"
            onClick={toggleCompleteBook}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              isCompleteBook
                ? 'bg-indigo-50/90 border-indigo-800 text-indigo-950 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCompleteBook ? (
                <CheckSquare className="w-5 h-5 text-indigo-800" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-sm">Complete Book Assessment (Full Chapter Pool)</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-950 font-bold uppercase tracking-wider">
              Full Book
            </span>
          </button>

          {/* Individual Chapters */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Or Select Individual Chapters:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {selectedSubject.chapters.map((ch) => {
                const isChecked = isCompleteBook || selectedChapterIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapter(ch.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-800 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs leading-tight">
                      <span className="font-bold text-slate-900 block">{ch.title}</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({ch.questions.length} items in pool)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              onClick={() => setSelectedSubject(null)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStartChapterTest}
              className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>START ASSESSMENT NOW →</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FEATURED EVALUATION: IQ AND GENERAL KNOWLEDGE (TOP CARD) */}
      {/* ======================================================== */}
      {!selectedSubject && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-xl p-5 text-white shadow-md border border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-sky-200 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-700">
                Featured Evaluation
              </span>
              <h4 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>IQ and General Knowledge</span>
              </h4>
              <p className="text-xs text-indigo-100 font-medium">Comprehensive Intelligence and GK Test</p>
            </div>
            <button
              onClick={() => {
                if (!verifyStudentOtp()) return;
                setIsGkIqModalOpen(true);
              }}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase tracking-wider px-6 py-3 rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
            >
              Start Test →
            </button>
          </div>

          {/* Standard Subject Sections Accordion */}
          <div className="text-center py-2">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Academic Testing Categories</h3>
            <p className="text-xs text-slate-500 font-medium">Select subject to configure chapter tests or full book evaluations</p>
          </div>

          {/* Middle Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => setOpenSection(openSection === 'middle' ? null : 'middle')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-800"></span>
                <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Middle School Section (Grade 6 - 8)
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 transition-transform ${openSection === 'middle' ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {openSection === 'middle' && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Subjects:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {middleSubjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleStartSubjectProceed(sub)}
                      className="p-4 bg-white border border-slate-200 hover:border-indigo-800 hover:bg-indigo-50/50 rounded-xl text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 block">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {sub.hasChapters ? `${sub.chapters.length} Chapters` : 'Unified Module'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider mt-3 block">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SSC Grade 9 & 10 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => setOpenSection(openSection === 'ssc9' || openSection === 'ssc10' ? null : 'ssc9')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-800"></span>
                <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  SSC Classes (9th & 10th Grade)
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 transition-transform ${openSection === 'ssc9' || openSection === 'ssc10' ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {(openSection === 'ssc9' || openSection === 'ssc10') && (
              <div className="p-4 bg-white space-y-6">
                {/* 9th Class */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-800" />
                      SSC Part 1 (9th Class)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ssc9Subjects.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleStartSubjectProceed(sub)}
                        className="p-3.5 bg-white border border-slate-200 hover:border-indigo-800 hover:bg-indigo-50/50 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-900 block">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {sub.hasChapters ? `${sub.chapters.length} Chapters` : 'Unified'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10th Class */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-800" />
                      SSC Part 2 (10th Class)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ssc10Subjects.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleStartSubjectProceed(sub)}
                        className="p-3.5 bg-white border border-slate-200 hover:border-indigo-800 hover:bg-indigo-50/50 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-900 block">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {sub.hasChapters ? `${sub.chapters.length} Chapters` : 'Unified'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* English Vocab Card in lower section */}
          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-sky-400">English Language & Syntax</span>
              <h4 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <span>Comprehensive English vocabulary, definitions, and syntax practice</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium">20 MCQs English test for definitions, grammar & vocabulary</p>
            </div>
            <button
              onClick={() => {
                const sub = middleSubjects.find((s) => s.id === 'middle_english') || ssc9Subjects.find((s) => s.id === 'ssc9_english');
                if (sub) handleStartSubjectProceed(sub);
              }}
              className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-xs transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Start English Test →
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FEATURED GK & IQ SELECTION MODAL */}
      {/* ======================================================== */}
      {isGkIqModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-fadeIn">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800 block">
                Featured Test Configuration
              </span>
              <h3 className="text-lg font-black text-slate-900 uppercase">IQ and General Knowledge</h3>
              <p className="text-xs text-slate-500">Comprehensive Intelligence and GK Test</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">Select Topics:</p>

              <button
                type="button"
                onClick={() => setSelectGk(!selectGk)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectGk ? 'bg-indigo-50/80 border-indigo-400 font-bold text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>1. General Knowledge (World & Pakistan)</span>
                {selectGk ? <CheckSquare className="w-5 h-5 text-indigo-800" /> : <Square className="w-5 h-5 text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectIq(!selectIq)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  selectIq ? 'bg-indigo-50/80 border-indigo-400 font-bold text-indigo-950' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>2. Intelligence Quotient (IQ & Logic)</span>
                {selectIq ? <CheckSquare className="w-5 h-5 text-indigo-800" /> : <Square className="w-5 h-5 text-slate-400" />}
              </button>

              <div className="p-3 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                {selectGk && selectIq ? (
                  <span>📊 Both topics selected: <strong>Total 30 MCQs</strong></span>
                ) : (
                  <span>📊 Single topic selected: <strong>Total 20 MCQs</strong></span>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsGkIqModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchGkIqTest}
                className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg cursor-pointer"
              >
                Start Test →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SPECIAL TEST OTP PROMPT MODAL */}
      {/* ======================================================== */}
      {isSpecialTestOtpModalOpen && specialTestConfig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border-2 border-indigo-800 shadow-2xl animate-fadeIn">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800 block">
                Security Verification
              </span>
              <h3 className="text-lg font-black text-slate-900 uppercase">{specialTestConfig.title}</h3>
              <p className="text-xs text-slate-500 font-medium">Enter Special TEST OTP Passcode to gain access</p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-950 space-y-1">
              <p><strong>Candidate:</strong> {studentName || 'Not Logged In'}</p>
              <p><strong>Class:</strong> {studentClass}</p>
              <p><strong>Subject:</strong> {specialTestConfig.subjectName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Enter Special TEST 6-Digit OTP <span className="text-indigo-800">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={specialTestOtpInput}
                onChange={(e) => setSpecialTestOtpInput(e.target.value)}
                placeholder="6-digit Special Test Passcode"
                className="w-full p-3 text-sm font-mono font-black tracking-wider text-center bg-slate-50 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800 text-indigo-950"
              />
            </div>

            {specialTestOtpError && (
              <div className="p-2.5 bg-rose-100 text-rose-900 text-xs font-bold rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-800" />
                <span>{specialTestOtpError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSpecialTestOtpModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndStartSpecialTest}
                className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg cursor-pointer"
              >
                Verify & Start Special Test →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
