import React, { useRef, useState } from 'react';
import { MCQQuestion } from '../types';
import { Download, FileText, Image as ImageIcon, RotateCcw, CheckCircle, XCircle, MinusCircle, Award } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultCardProps {
  results: {
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
  };
  onRetakeTest: () => void;
  onGoHome: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ results, onRetakeTest, onGoHome }) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImg, setIsExportingImg] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Export as Image (PNG)
  const handleExportImage = async () => {
    if (!exportRef.current) return;
    setIsExportingImg(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${results.studentName.replace(/\s+/g, '_')}_${results.subjectName.replace(/\s+/g, '_')}_Result.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Error generating result image.');
    } finally {
      setIsExportingImg(false);
    }
  };

  // Export as PDF
  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    setIsExportingPdf(true);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${results.studentName.replace(/\s+/g, '_')}_FCPS_ResultCard.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Error generating PDF report.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const isPassed = results.scorePercentage >= 50;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onRetakeTest}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-800" />
            <span>Retake Test</span>
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Back to Subjects</span>
          </button>
        </div>

        {/* Download Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportImage}
            disabled={isExportingImg}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 rounded-md font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-800" />
            <span>{isExportingImg ? 'Generating...' : 'Export Image'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-md font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Official Exportable Result Card Container */}
      <div
        ref={exportRef}
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-900"
      >
        {/* Header Branding */}
        <div className="border-b border-slate-200 pb-4 text-center space-y-1">
          <div className="inline-flex items-center justify-center gap-3 mb-1">
            <img src="/fcps_logo.svg" alt="FCPS Logo" className="w-10 h-10 object-contain" />
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                FCPS MCQs Hub
              </h2>
              <p className="text-xs text-indigo-900 font-extrabold tracking-wide">
                Your Gateway to Exam Readiness
              </p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            Official MCQs Academic Test Result Statement • FCPS&C
          </p>
        </div>

        {/* Student & Test Credentials Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Student Name</span>
            <span className="text-sm font-bold text-slate-900">{results.studentName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Class / Grade</span>
            <span className="text-sm font-bold text-slate-900">{results.studentClass}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Subject Taken</span>
            <span className="text-sm font-bold text-indigo-950">{results.subjectName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Verification Status</span>
            <span className="text-sm font-bold text-slate-800">
              {results.isLoggedIn ? `OTP Verified (${results.otp || '123456'})` : 'Guest Practice Mode'}
            </span>
          </div>
        </div>

        {/* Big Score Summary Banner */}
        <div
          className={`p-6 rounded-xl text-center border-2 space-y-2 ${
            isPassed
              ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex justify-center items-center gap-2">
            <Award className={`w-7 h-7 ${isPassed ? 'text-indigo-800' : 'text-amber-700'}`} />
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{results.scorePercentage}% Score</h3>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest">
            {isPassed ? 'Status: EXCELLENT PASS' : 'Status: NEEDS IMPROVEMENT'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Items</span>
            <span className="text-lg font-black text-slate-900">{results.totalQuestions}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest block">Correct</span>
            <span className="text-lg font-black text-emerald-800">{results.correctAnswers}</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
            <span className="text-[10px] text-rose-900 font-bold uppercase tracking-widest block">Wrong</span>
            <span className="text-lg font-black text-rose-900">{results.wrongAnswers}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest block">Skipped</span>
            <span className="text-lg font-black text-amber-900">{results.skippedQuestions}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium text-center uppercase tracking-wider">
          ⏱️ Duration: <strong>{formatTime(results.timeTakenSeconds)}</strong> • Generated on {new Date().toLocaleString("en-PK")}
        </div>

        {/* Detailed Question Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1.5">
            Detailed Performance Breakdown & Answer Keys:
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {results.userAnswers.map((item, idx) => {
              const q = item.question;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    item.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : item.selectedOptIndex === null
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2 font-bold text-slate-900">
                    <span className="shrink-0 font-bold">Q{idx + 1}.</span>
                    <span className="flex-1">{q.q}</span>
                    {item.isCorrect ? (
                      <span className="text-emerald-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Correct
                      </span>
                    ) : item.selectedOptIndex === null ? (
                      <span className="text-amber-800 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 shrink-0">
                        <MinusCircle className="w-3.5 h-3.5 text-amber-600" /> Skipped
                      </span>
                    ) : (
                      <span className="text-rose-900 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 shrink-0">
                        <XCircle className="w-3.5 h-3.5 text-rose-800" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="pl-5 space-y-1 text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">Your Choice: </span>
                      {item.selectedOptIndex !== null ? (
                        <span className={item.isCorrect ? 'font-bold text-emerald-900' : 'font-bold text-rose-900'}>
                          {String.fromCharCode(65 + item.selectedOptIndex)}. {q.opts[item.selectedOptIndex]}
                        </span>
                      ) : (
                        <span className="font-bold text-amber-800">No Answer Selected</span>
                      )}
                    </div>

                    {!item.isCorrect && (
                      <div>
                        <span className="font-semibold text-slate-500">Correct Answer: </span>
                        <span className="font-bold text-emerald-900">
                          {String.fromCharCode(65 + q.ans)}. {q.opts[q.ans]}
                        </span>
                      </div>
                    )}

                    {q.explain && (
                      <p className="text-[11px] text-slate-500 italic pt-0.5">
                        💡 Note: {q.explain}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Signature Notice */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest text-center flex justify-between items-center">
          <span>FCPS MCQs Hub • FCPS&C</span>
          <span>Verified School Digital Record</span>
        </div>
      </div>
    </div>
  );
};
