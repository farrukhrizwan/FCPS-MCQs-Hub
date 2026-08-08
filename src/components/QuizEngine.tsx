import React, { useState, useEffect } from 'react';
import { MCQQuestion, Subject } from '../types';
import { Timer, ArrowRight, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';

interface QuizEngineProps {
  studentName: string;
  studentClass: string;
  isLoggedIn: boolean;
  otp: string;
  subject: Subject;
  selectedQuestions: MCQQuestion[];
  onFinishTest: (results: {
    studentName: string;
    studentClass: string;
    isLoggedIn: boolean;
    otp: string;
    subjectName: string;
    selectedChapters: string[];
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedQuestions: number;
    scorePercentage: number;
    timeTakenSeconds: number;
    userAnswers: { question: MCQQuestion; selectedOptIndex: number | null; isCorrect: boolean }[];
  }) => void;
  onCancelTest: () => void;
}

const SECONDS_PER_QUESTION = 20;

export const QuizEngine: React.FC<QuizEngineProps> = ({
  studentName,
  studentClass,
  isLoggedIn,
  otp,
  subject,
  selectedQuestions,
  onFinishTest,
  onCancelTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(selectedQuestions.length).fill(null)
  );

  // Timer per question (20 seconds)
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(SECONDS_PER_QUESTION);
  const [totalTimeTaken, setTotalTimeTaken] = useState<number>(0);

  // Zoom feature for mobile/desktop readability
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const currentQ = selectedQuestions[currentIndex];

  // Total timer increment
  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(totalTimer);
  }, []);

  // Per-Question 20 Second Countdown Timer
  useEffect(() => {
    setQuestionTimeLeft(SECONDS_PER_QUESTION);

    const qTimer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestionAuto();
          return SECONDS_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimer);
  }, [currentIndex]);

  const handleNextQuestionAuto = () => {
    if (currentIndex < selectedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitFinalTest();
    }
  };

  const handleSelectOption = (optIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < selectedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitFinalTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitFinalTest = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const formattedAnswers = selectedQuestions.map((q, idx) => {
      const selected = userAnswers[idx];
      let isCorrect = false;

      if (selected === null) {
        skipped++;
      } else if (selected === q.ans) {
        correct++;
        isCorrect = true;
      } else {
        wrong++;
      }

      return {
        question: q,
        selectedOptIndex: selected,
        isCorrect,
      };
    });

    const scorePct = Math.round((correct / selectedQuestions.length) * 100);

    onFinishTest({
      studentName,
      studentClass,
      isLoggedIn,
      otp,
      subjectName: subject.name,
      selectedChapters: [subject.name],
      totalQuestions: selectedQuestions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skippedQuestions: skipped,
      scorePercentage: scorePct,
      timeTakenSeconds: totalTimeTaken,
      userAnswers: formattedAnswers,
    });
  };

  const timerPercentage = (questionTimeLeft / SECONDS_PER_QUESTION) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Test Header Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-950 border border-indigo-200 uppercase tracking-wider">
              {subject.name}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Question {currentIndex + 1} of {selectedQuestions.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-1">
            Candidate: <span className="text-indigo-900">{studentName || 'Practice Mode'}</span> ({studentClass})
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg text-xs font-bold text-slate-700">
          <span className="text-[11px] text-slate-500 pl-1 hidden sm:inline uppercase tracking-wider">Font:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(90, z - 10))}
            className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-700" />
          </button>
          <span className="w-8 text-center text-slate-900">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
            className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-700" />
          </button>
        </div>

        <button
          onClick={onCancelTest}
          className="text-xs font-bold uppercase tracking-wider text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
        >
          Quit Test
        </button>
      </div>

      {/* 20 Seconds Per Question Countdown Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
            <Timer className={`w-4 h-4 ${questionTimeLeft <= 5 ? 'text-amber-600 animate-bounce' : 'text-indigo-900'}`} />
            <span>Time Left for Question:</span>
          </span>
          <span
            className={`text-xs font-mono px-2.5 py-0.5 rounded-md font-bold ${
              questionTimeLeft <= 5 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-900'
            }`}
          >
            {questionTimeLeft}s
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              questionTimeLeft <= 5 ? 'bg-amber-500' : 'bg-indigo-800'
            }`}
            style={{ width: `${timerPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card with Zoom Support */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
        style={{ fontSize: `${zoomLevel}%` }}
      >
        {/* Question Text */}
        <div className="space-y-1">
          {currentQ.chapterTitle && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-800 block">
              {currentQ.chapterTitle}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            Q{currentIndex + 1}. {currentQ.q}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-2.5">
          {currentQ.opts.map((opt, optIdx) => {
            const isSelected = userAnswers[currentIndex] === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 border-2 border-indigo-800 text-indigo-950 font-bold shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-800 font-medium hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm leading-snug flex-1 text-slate-900">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider border transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline uppercase tracking-wider">
            {userAnswers[currentIndex] !== null ? 'Option Selected' : 'Not Answered'}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider bg-indigo-900 hover:bg-indigo-950 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>{currentIndex === selectedQuestions.length - 1 ? 'Finish Test' : 'Next Item'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Grid Navigator */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          Question Progress Navigator:
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
          {selectedQuestions.map((_, idx) => {
            const isAnswered = userAnswers[idx] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-900 text-white ring-2 ring-indigo-900 ring-offset-1'
                    : isAnswered
                    ? 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
