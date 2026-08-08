import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SubjectSelector } from './components/SubjectSelector';
import { QuizEngine } from './components/QuizEngine';
import { ResultCard } from './components/ResultCard';
import { AdminPanel } from './components/AdminPanel';
import {
  INITIAL_QUESTION_BANK,
  getStoredQuestions,
  saveStoredQuestions,
  getStoredClasses,
  saveStoredClasses
} from './data/questionsData';
import {
  Subject,
  MCQQuestion,
  SpecialTestConfig,
  ClassOtpConfig,
  StudentResultRecord,
  SystemClass
} from './types';
import { Shield, Key, AlertCircle, X } from 'lucide-react';
import {
  saveFirestoreQuestions,
  subscribeFirestoreQuestions,
  saveFirestoreConfig,
  subscribeFirestoreConfig,
  saveFirestoreStudentResult,
  subscribeFirestoreStudentResults
} from './lib/firebase';

type ViewMode = 'home' | 'quiz' | 'result';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  // Question bank state (persisted to localStorage and syncs with Firestore)
  const [questionBank, setQuestionBank] = useState<Subject[]>(getStoredQuestions());

  // Dynamic system classes state
  const [classesList, setClassesList] = useState<SystemClass[]>(getStoredClasses());

  // Admin Custom Password
  const [adminPassword, setAdminPassword] = useState<string>('admin123');

  const handleUpdateClassesList = (newClasses: SystemClass[]) => {
    setClassesList(newClasses);
    saveStoredClasses(newClasses);
    saveFirestoreConfig({ classesList: newClasses });
  };

  // Special Test Config state
  const [specialTestConfig, setSpecialTestConfig] = useState<SpecialTestConfig | null>(() => {
    try {
      const stored = localStorage.getItem('FCPS_SPECIAL_TEST_CONFIG');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      id: 'ST_001',
      title: 'FCPS ANNUAL BOARD PREPARATION SPECIAL TEST',
      targetClass: '9th Class',
      subjectName: 'Mathematics & Physics',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      otpCode: '998877',
      isActive: true,
      durationMinutes: 30,
      questions: []
    };
  });

  // Class OTPs state
  const [classOtps, setClassOtps] = useState<ClassOtpConfig>(() => {
    try {
      const stored = localStorage.getItem('FCPS_CLASS_OTPS');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      middleOtp: '123456',
      ssc9Otp: '999999',
      ssc10Otp: '101010'
    };
  });

  // Student Results Records
  const [studentResults, setStudentResults] = useState<StudentResultRecord[]>(() => {
    try {
      const stored = localStorage.getItem('FCPS_STUDENT_RESULTS');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Admin Modal state
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  // Active Quiz State
  const [activeTestConfig, setActiveTestConfig] = useState<{
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    selectedSubject: Subject;
  } | null>(null);

  const [activeQuestions, setActiveQuestions] = useState<MCQQuestion[]>([]);

  // Active Test Result State
  const [activeResult, setActiveResult] = useState<any>(null);

  // Sync with Firestore real-time
  useEffect(() => {
    // 1. Subscribe to Questions Bank
    const unsubscribeQuestions = subscribeFirestoreQuestions((bank) => {
      if (Array.isArray(bank) && bank.length > 0) {
        setQuestionBank(bank);
        saveStoredQuestions(bank);
      }
    });

    // 2. Subscribe to Config (Class OTPs, Special Test, Classes List, Admin Password)
    const unsubscribeConfig = subscribeFirestoreConfig((cfg) => {
      if (!cfg) return;
      if (cfg.classOtps) {
        setClassOtps(cfg.classOtps);
        localStorage.setItem('FCPS_CLASS_OTPS', JSON.stringify(cfg.classOtps));
      }
      if (cfg.specialTestConfig !== undefined) {
        setSpecialTestConfig(cfg.specialTestConfig);
        if (cfg.specialTestConfig) {
          localStorage.setItem('FCPS_SPECIAL_TEST_CONFIG', JSON.stringify(cfg.specialTestConfig));
        } else {
          localStorage.removeItem('FCPS_SPECIAL_TEST_CONFIG');
        }
      }
      if (cfg.classesList && Array.isArray(cfg.classesList)) {
        setClassesList(cfg.classesList);
        saveStoredClasses(cfg.classesList);
      }
      if (cfg.adminPassword) {
        setAdminPassword(cfg.adminPassword);
      }
    });

    // 3. Subscribe to Student Results
    const unsubscribeResults = subscribeFirestoreStudentResults((results) => {
      if (Array.isArray(results)) {
        setStudentResults(results);
        localStorage.setItem('FCPS_STUDENT_RESULTS', JSON.stringify(results));
      }
    });

    // Fallback sync from backend server if running Node environment
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestionBank(data.questions);
          saveStoredQuestions(data.questions);
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeQuestions();
      unsubscribeConfig();
      unsubscribeResults();
    };
  }, []);

  // Update handlers
  const handleUpdateQuestionBank = (newBank: Subject[]) => {
    setQuestionBank(newBank);
    saveStoredQuestions(newBank);
    saveFirestoreQuestions(newBank);
  };

  const handleUpdateSpecialTestConfig = (config: SpecialTestConfig | null) => {
    setSpecialTestConfig(config);
    if (config) {
      localStorage.setItem('FCPS_SPECIAL_TEST_CONFIG', JSON.stringify(config));
    } else {
      localStorage.removeItem('FCPS_SPECIAL_TEST_CONFIG');
    }
    saveFirestoreConfig({ specialTestConfig: config });
  };

  const handleUpdateClassOtps = (otps: ClassOtpConfig) => {
    setClassOtps(otps);
    localStorage.setItem('FCPS_CLASS_OTPS', JSON.stringify(otps));
    saveFirestoreConfig({ classOtps: otps });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // 1. Standard Subject Test Start
  const handleStartStandardTest = (config: {
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    selectedSubject: Subject;
    selectedChapterIds: number[];
    isCompleteBook: boolean;
  }) => {
    const sub = config.selectedSubject;
    let pool: MCQQuestion[] = [];

    if (!sub.hasChapters) {
      sub.chapters.forEach((ch) => pool.push(...ch.questions));
      pool = shuffleArray(pool).slice(0, Math.min(20, pool.length));
    } else if (config.isCompleteBook) {
      sub.chapters.forEach((ch) => {
        const shuffledChQ = shuffleArray(ch.questions);
        pool.push(...shuffledChQ.slice(0, 5));
      });
      pool = shuffleArray(pool).slice(0, Math.min(30, pool.length));
    } else {
      sub.chapters.forEach((ch) => {
        if (config.selectedChapterIds.includes(ch.id)) {
          const shuffledChQ = shuffleArray(ch.questions).map((q) => ({
            ...q,
            chapterTitle: ch.title,
          }));
          pool.push(...shuffledChQ.slice(0, 10));
        }
      });
      pool = shuffleArray(pool);
    }

    if (pool.length === 0) {
      alert('No questions available in the selected subject or chapters.');
      return;
    }

    setActiveTestConfig({
      studentName: config.studentName,
      studentClass: config.studentClass,
      isLoggedIn: config.isLoggedIn,
      otp: config.otp,
      selectedSubject: config.selectedSubject,
    });
    setActiveQuestions(pool);
    setViewMode('quiz');
  };

  // 2. Featured GK & IQ Test Start
  const handleStartGkIqTest = (config: {
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    topics: ('gk' | 'iq')[];
    questionCount: number;
  }) => {
    const gkIqSubject = questionBank.find((s) => s.category === 'gk_iq');
    if (!gkIqSubject) {
      alert('GK & IQ question bank not found.');
      return;
    }

    let pool: MCQQuestion[] = [];

    if (config.topics.includes('gk')) {
      const gkChapter = gkIqSubject.chapters.find((c) => c.title.includes('General Knowledge')) || gkIqSubject.chapters[0];
      if (gkChapter) {
        const sliced = shuffleArray(gkChapter.questions).slice(0, config.topics.length === 2 ? 15 : 20) as MCQQuestion[];
        pool.push(...sliced);
      }
    }

    if (config.topics.includes('iq')) {
      const iqChapter = gkIqSubject.chapters.find((c) => c.title.includes('Intelligence')) || gkIqSubject.chapters[1];
      if (iqChapter) {
        const sliced = shuffleArray(iqChapter.questions).slice(0, config.topics.length === 2 ? 15 : 20) as MCQQuestion[];
        pool.push(...sliced);
      }
    }

    pool = shuffleArray(pool).slice(0, config.questionCount);

    setActiveTestConfig({
      studentName: config.studentName,
      studentClass: config.studentClass,
      isLoggedIn: config.isLoggedIn,
      otp: config.otp,
      selectedSubject: {
        id: 'gk_iq_custom',
        name: 'IQ and General Knowledge Test',
        category: 'gk_iq',
        hasChapters: false,
        chapters: [{ id: 1, title: 'IQ & GK', questions: pool }]
      }
    });
    setActiveQuestions(pool);
    setViewMode('quiz');
  };

  // 3. Special Test Start
  const handleStartSpecialTest = (config: {
    studentName: string;
    studentClass: string;
    otp: string;
    specialTest: SpecialTestConfig;
  }) => {
    let pool = config.specialTest.questions;

    // Fallback if special test questions array is empty
    if (!pool || pool.length === 0) {
      const ssc9Math = questionBank.find((s) => s.id === 'ssc9_maths');
      if (ssc9Math && ssc9Math.chapters.length > 0) {
        pool = ssc9Math.chapters[0].questions;
      }
    }

    setActiveTestConfig({
      studentName: config.studentName,
      studentClass: config.studentClass,
      isLoggedIn: true,
      otp: config.otp,
      selectedSubject: {
        id: 'special_test_active',
        name: config.specialTest.title,
        category: 'special',
        hasChapters: false,
        chapters: [{ id: 1, title: config.specialTest.subjectName, questions: pool }]
      }
    });
    setActiveQuestions(pool);
    setViewMode('quiz');
  };

  // Finish Test & Save Result
  const handleFinishTest = async (results: any) => {
    setActiveResult(results);
    setViewMode('result');

    const newRecord: StudentResultRecord = {
      id: `RES_${Date.now()}`,
      studentName: results.studentName,
      studentClass: results.studentClass,
      subjectName: results.subjectName,
      scorePercentage: results.scorePercentage,
      correctAnswers: results.correctAnswers,
      totalQuestions: results.totalQuestions,
      completedAt: new Date().toISOString(),
      otp: results.otp
    };

    const updatedRecords = [newRecord, ...studentResults];
    setStudentResults(updatedRecords);
    localStorage.setItem('FCPS_STUDENT_RESULTS', JSON.stringify(updatedRecords));

    if (results.isLoggedIn) {
      saveFirestoreStudentResult(newRecord);
      try {
        await fetch('/api/student/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(results),
        });
      } catch (err) {}
    }
  };

  const handleRetakeCurrentTest = () => {
    if (activeTestConfig && activeQuestions.length > 0) {
      setViewMode('quiz');
    } else {
      setViewMode('home');
    }
  };

  // Admin Passcode Check
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    const input = adminPasswordInput.trim();
    if (input === adminPassword || input === 'admin123' || input === 'fcps2026') {
      setIsAdminAuthenticated(true);
    } else {
      setAdminLoginError('Invalid Admin Password. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900">
      {/* Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        studentName={activeTestConfig?.studentName}
        studentClass={activeTestConfig?.studentClass}
        isLoggedIn={activeTestConfig?.isLoggedIn}
        onResetToHome={() => setViewMode('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 w-full max-w-5xl mx-auto">
        {viewMode === 'home' && (
          <SubjectSelector
            questionBank={questionBank}
            specialTestConfig={specialTestConfig}
            classOtps={classOtps}
            classesList={classesList}
            onStartStandardTest={handleStartStandardTest}
            onStartGkIqTest={handleStartGkIqTest}
            onStartSpecialTest={handleStartSpecialTest}
          />
        )}

        {viewMode === 'quiz' && activeTestConfig && activeQuestions.length > 0 && (
          <QuizEngine
            studentName={activeTestConfig.studentName}
            studentClass={activeTestConfig.studentClass}
            isLoggedIn={activeTestConfig.isLoggedIn}
            otp={activeTestConfig.otp}
            subject={activeTestConfig.selectedSubject}
            selectedQuestions={activeQuestions}
            onFinishTest={handleFinishTest}
            onCancelTest={() => setViewMode('home')}
          />
        )}

        {viewMode === 'result' && activeResult && (
          <ResultCard
            results={activeResult}
            onRetakeTest={handleRetakeCurrentTest}
            onGoHome={() => setViewMode('home')}
          />
        )}
      </main>

      {/* Admin Panel Password Verification Modal */}
      {isAdminOpen && (
        <>
          {!isAdminAuthenticated ? (
            <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-gray-200 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase">FCPS School Admin</h3>
                      <p className="text-[10px] text-gray-500 font-medium">Authentication Required</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdminOpen(false);
                      setAdminLoginError('');
                    }}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Admin Access Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="password"
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-red-600 font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 block pt-1">Default: admin123 or fcps2026</span>
                  </div>

                  {adminLoginError && (
                    <div className="p-2 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{adminLoginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Login to Admin Panel
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <AdminPanel
              questionBank={questionBank}
              onUpdateQuestionBank={handleUpdateQuestionBank}
              specialTestConfig={specialTestConfig}
              onUpdateSpecialTestConfig={handleUpdateSpecialTestConfig}
              classOtps={classOtps}
              onUpdateClassOtps={handleUpdateClassOtps}
              studentResults={studentResults}
              onClearResults={() => {
                setStudentResults([]);
                localStorage.removeItem('FCPS_STUDENT_RESULTS');
              }}
              classesList={classesList}
              onUpdateClassesList={handleUpdateClassesList}
              onClose={() => {
                setIsAdminOpen(false);
                setIsAdminAuthenticated(false);
              }}
            />
          )}
        </>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
