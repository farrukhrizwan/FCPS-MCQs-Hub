import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  CSVRow,
  QuestionFormat,
  SpecialTestConfig,
  ClassOtpConfig,
  Subject,
  MCQQuestion,
  StudentResultRecord,
  SystemClass
} from '../types';
import {
  Download,
  Upload,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Key,
  Save,
  CheckCircle2,
  X,
  FileJson,
  Layers,
  Shield,
  HelpCircle,
  AlertTriangle,
  Type,
  PlusCircle,
  Settings
} from 'lucide-react';
import { buildCompositeId } from '../utils/compositeId';

interface AdminPanelProps {
  questionBank: Subject[];
  onUpdateQuestionBank: (newBank: Subject[]) => void;
  specialTestConfig: SpecialTestConfig | null;
  onUpdateSpecialTestConfig: (config: SpecialTestConfig | null) => void;
  classOtps: ClassOtpConfig;
  onUpdateClassOtps: (otps: ClassOtpConfig) => void;
  studentResults: StudentResultRecord[];
  onClearResults: () => void;
  classesList?: SystemClass[];
  onUpdateClassesList?: (newClasses: SystemClass[]) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questionBank,
  onUpdateQuestionBank,
  specialTestConfig,
  onUpdateSpecialTestConfig,
  classOtps,
  onUpdateClassOtps,
  studentResults,
  onClearResults,
  classesList = [],
  onUpdateClassesList,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'csv' | 'titles' | 'scaling' | 'special_test' | 'otps' | 'results'>('editor');

  // Search & Filter state for MCQ Viewer
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Live Editor State
  const [editingQuestion, setEditingQuestion] = useState<{
    subjectId: string;
    chapterId: number;
    question: MCQQuestion;
  } | null>(null);

  // Manual Single Question Add State - Sequential Dropdowns (Requirement 2)
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [addMcqClass, setAddMcqClass] = useState<string>('');
  const [addMcqSubjectId, setAddMcqSubjectId] = useState<string>('');
  const [addMcqChapterId, setAddMcqChapterId] = useState<string | number>('');
  const [addMcqError, setAddMcqError] = useState<string>('');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newOptA, setNewOptA] = useState<string>('');
  const [newOptB, setNewOptB] = useState<string>('');
  const [newOptC, setNewOptC] = useState<string>('');
  const [newOptD, setNewOptD] = useState<string>('');
  const [newCorrectIndex, setNewCorrectIndex] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState<string>('');

  // CSV Import & Template Config State (Requirement 3)
  const [csvConfigClass, setCsvConfigClass] = useState<string>(classesList[0]?.id || 'ssc9');
  const [csvConfigSubject, setCsvConfigSubject] = useState<string>('');
  const [csvConfigChapter, setCsvConfigChapter] = useState<number>(1);
  const [csvStatusMessage, setCsvStatusMessage] = useState<string>('');
  const [csvErrorMessage, setCsvErrorMessage] = useState<string>('');

  // Data Abstraction & Title Renamer State (Requirement 5)
  const [renameTargetClassId, setRenameTargetClassId] = useState<string>(classesList[0]?.id || 'ssc9');
  const [newClassTitle, setNewClassTitle] = useState<string>('');
  const [renameTargetSubjectId, setRenameTargetSubjectId] = useState<string>(questionBank[0]?.id || '');
  const [newSubjectTitle, setNewSubjectTitle] = useState<string>('');
  const [renameTargetChapterSubId, setRenameTargetChapterSubId] = useState<string>(questionBank[0]?.id || '');
  const [renameTargetChapterId, setRenameTargetChapterId] = useState<number>(1);
  const [newChapterTitle, setNewChapterTitle] = useState<string>('');
  const [titleMessage, setTitleMessage] = useState<string>('');

  // System Scaling State (Requirement 6)
  const [newClassSlug, setNewClassSlug] = useState<string>('');
  const [newClassNameInput, setNewClassNameInput] = useState<string>('');
  const [parentClassForNewSub, setParentClassForNewSub] = useState<string>(classesList[0]?.id || 'ssc9');
  const [newSubSlug, setNewSubSlug] = useState<string>('');
  const [newSubNameInput, setNewSubNameInput] = useState<string>('');
  const [scalingMessage, setScalingMessage] = useState<string>('');

  // Special Test Form State
  const [stTitle, setStTitle] = useState<string>(specialTestConfig?.title || 'ANNUAL BOARD PREPARATION TEST');
  const [stTargetClass, setStTargetClass] = useState<string>(specialTestConfig?.targetClass || '9th Class');
  const [stSubjectName, setStSubjectName] = useState<string>(specialTestConfig?.subjectName || 'Mathematics & Physics');
  const [stStartTime, setStStartTime] = useState<string>(
    specialTestConfig?.startTime || new Date().toISOString().slice(0, 16)
  );
  const [stEndTime, setStEndTime] = useState<string>(
    specialTestConfig?.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [stOtpCode, setStOtpCode] = useState<string>(specialTestConfig?.otpCode || '998877');
  const [stDurationMinutes, setStDurationMinutes] = useState<number>(specialTestConfig?.durationMinutes || 30);
  const [stIsActive, setStIsActive] = useState<boolean>(specialTestConfig?.isActive ?? true);
  const [stQuestions, setStQuestions] = useState<MCQQuestion[]>(specialTestConfig?.questions || []);

  // Quick Question Selection for Special Test
  const [stSelectedSubjectForPick, setStSelectedSubjectForPick] = useState<string>(questionBank[0]?.id || '');

  // OTP Config Form State
  const [middleOtpInput, setMiddleOtpInput] = useState<string>(classOtps.middleOtp);
  const [ssc9OtpInput, setSsc9OtpInput] = useState<string>(classOtps.ssc9Otp);
  const [ssc10OtpInput, setSsc10OtpInput] = useState<string>(classOtps.ssc10Otp);
  const [otpSaveSuccess, setOtpSaveSuccess] = useState<boolean>(false);

  // ==========================================
  // FEATURE 1: BULK CSV UPLOAD & TEMPLATE GENERATION
  // ==========================================
  const handleDownloadBlankCSV = () => {
    const headers = [
      'subject',
      'id',
      'question',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct',
      'test_type'
    ];

    const sampleRow: CSVRow = {
      subject: 'ssc9_maths',
      id: 'm9_sample_1',
      question: 'What is the value of i^2 in complex numbers?',
      option_a: '1',
      option_b: '-1',
      option_c: 'i',
      option_d: '-i',
      correct: 'B',
      test_type: 'standard'
    };

    const csvContent = Papa.unparse([headers, Object.values(sampleRow)]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FCPS_MCQ_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Requirement 3: Smart Segregated CSV Template Generator
  const handleGenerateClassSpecificCSV = () => {
    const selectedClassObj = classesList.find((c) => c.id === csvConfigClass) || { id: csvConfigClass, name: csvConfigClass };
    const selectedSubObj = questionBank.find((s) => s.id === csvConfigSubject) || { id: csvConfigSubject, name: csvConfigSubject };

    const headers = [
      'class',
      'subject',
      'chapter',
      'question',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct',
      'explain',
      'test_type'
    ];

    const sampleRows = [
      [selectedClassObj.name, selectedSubObj.name, csvConfigChapter, 'Sample question statement 1...', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'Explanation for Q1', 'standard'],
      [selectedClassObj.name, selectedSubObj.name, csvConfigChapter, 'Sample question statement 2...', 'Option A', 'Option B', 'Option C', 'Option D', 'B', 'Explanation for Q2', 'standard'],
      [selectedClassObj.name, selectedSubObj.name, csvConfigChapter, '', '', '', '', '', 'A', '', 'standard'],
      [selectedClassObj.name, selectedSubObj.name, csvConfigChapter, '', '', '', '', '', 'A', '', 'standard'],
      [selectedClassObj.name, selectedSubObj.name, csvConfigChapter, '', '', '', '', '', 'A', '', 'standard']
    ];

    const csvContent = Papa.unparse({ fields: headers, data: sampleRows });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${selectedClassObj.id}_${selectedSubObj.id}_ch${csvConfigChapter}_template.csv`.toLowerCase().replace(/[^a-z0-9_.]/g, '_');
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvStatusMessage('');
    setCsvErrorMessage('');

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setCsvErrorMessage(`CSV Parsing warning: ${results.errors[0].message}`);
        }

        const rows = results.data;
        if (!rows || rows.length === 0) {
          setCsvErrorMessage('The uploaded CSV file contains no rows.');
          return;
        }

        let importedCount = 0;
        const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];

        rows.forEach((row) => {
          if (!row.question || !row.option_a || !row.option_b) return;

          const rawClass = row.class || 'ssc9';
          const rawSub = row.subject || 'ssc9_maths';
          const rawCh = row.chapter || '1';

          let targetSubject = newBank.find((s) => s.id === rawSub || s.name.toLowerCase() === String(rawSub).toLowerCase());

          if (!targetSubject) {
            targetSubject = {
              id: String(rawSub).toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              name: String(rawSub).toUpperCase().replace('_', ' '),
              category: String(rawClass).toLowerCase().replace(/[^a-z0-9_]/g, '_'),
              hasChapters: true,
              chapters: []
            };
            newBank.push(targetSubject);
          }

          const chNum = parseInt(String(rawCh).replace(/\D/g, ''), 10) || 1;
          let targetChapter = targetSubject.chapters.find((c) => c.id === chNum);
          if (!targetChapter) {
            targetChapter = {
              id: chNum,
              title: `Chapter ${chNum}`,
              compositeId: buildCompositeId(targetSubject.category, targetSubject.name, chNum),
              questions: []
            };
            targetSubject.chapters.push(targetChapter);
          }

          // Compile options array
          const opts = [
            row.option_a?.trim() || 'Option A',
            row.option_b?.trim() || 'Option B',
            row.option_c?.trim() || 'Option C',
            row.option_d?.trim() || 'Option D'
          ];

          // Determine correct index (A->0, B->1, C->2, D->3 or 0..3)
          let correctIdx = 0;
          const rawCorrect = String(row.correct || '0').trim().toUpperCase();
          if (rawCorrect === 'A' || rawCorrect === '0') correctIdx = 0;
          else if (rawCorrect === 'B' || rawCorrect === '1') correctIdx = 1;
          else if (rawCorrect === 'C' || rawCorrect === '2') correctIdx = 2;
          else if (rawCorrect === 'D' || rawCorrect === '3') correctIdx = 3;

          const newQ: MCQQuestion = {
            id: row.id?.trim() || `csv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            q: row.question.trim(),
            opts,
            ans: correctIdx,
            explain: row.explain || `Correct option is ${opts[correctIdx]}`,
            test_type: row.test_type || 'standard'
          };

          targetChapter.questions.push(newQ);
          importedCount++;
        });

        onUpdateQuestionBank(newBank);
        setCsvStatusMessage(`Successfully imported and merged ${importedCount} MCQs into the question bank!`);
      },
      error: (err) => {
        setCsvErrorMessage(`Failed to process CSV file: ${err.message}`);
      }
    });
  };

  const handleExportToTestsJson = () => {
    const exportPayload = {
      app_version: '2026.1',
      exported_at: new Date().toISOString(),
      classes_list: classesList,
      question_bank: questionBank,
      special_test_config: specialTestConfig,
      class_otps: classOtps,
      student_results_count: studentResults.length
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'tests.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Requirement 5 Handlers: Data Abstraction & Title Renamer
  const handleSaveClassTitle = () => {
    if (!newClassTitle.trim() || !onUpdateClassesList) return;
    const updated = classesList.map((c) => (c.id === renameTargetClassId ? { ...c, name: newClassTitle.trim() } : c));
    onUpdateClassesList(updated);
    setTitleMessage(`Class title updated to "${newClassTitle.trim()}"!`);
    setNewClassTitle('');
    setTimeout(() => setTitleMessage(''), 3000);
  };

  const handleSaveSubjectTitle = () => {
    if (!newSubjectTitle.trim()) return;
    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    const sub = newBank.find((s) => s.id === renameTargetSubjectId);
    if (sub) {
      sub.name = newSubjectTitle.trim();
      onUpdateQuestionBank(newBank);
      setTitleMessage(`Subject title updated to "${newSubjectTitle.trim()}"! (Internal ID preserved)`);
      setNewSubjectTitle('');
      setTimeout(() => setTitleMessage(''), 3000);
    }
  };

  const handleSaveChapterTitle = () => {
    if (!newChapterTitle.trim()) return;
    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    const sub = newBank.find((s) => s.id === renameTargetChapterSubId);
    if (sub) {
      const ch = sub.chapters.find((c) => c.id === renameTargetChapterId);
      if (ch) {
        ch.title = newChapterTitle.trim();
        onUpdateQuestionBank(newBank);
        setTitleMessage(`Chapter title updated to "${newChapterTitle.trim()}"!`);
        setNewChapterTitle('');
        setTimeout(() => setTitleMessage(''), 3000);
      }
    }
  };

  // Requirement 6 Handlers: Dynamic System Scaling
  const handleAddClassToSystem = () => {
    if (!newClassSlug.trim() || !newClassNameInput.trim()) {
      setScalingMessage('Error: Please provide both Class Slug ID and Display Name.');
      return;
    }

    const cleanSlug = newClassSlug.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (classesList.some((c) => c.id === cleanSlug)) {
      setScalingMessage('Error: A class with this Slug ID already exists.');
      return;
    }

    const newClassObj: SystemClass = {
      id: cleanSlug,
      name: newClassNameInput.trim(),
      categorySlug: cleanSlug
    };

    const updated = [...classesList, newClassObj];
    if (onUpdateClassesList) onUpdateClassesList(updated);

    setScalingMessage(`Success: Added new class "${newClassNameInput.trim()}" (${cleanSlug})!`);
    setNewClassSlug('');
    setNewClassNameInput('');
    setTimeout(() => setScalingMessage(''), 4000);
  };

  const handleAddSubjectToSystem = () => {
    if (!parentClassForNewSub || !newSubSlug.trim() || !newSubNameInput.trim()) {
      setScalingMessage('Error: Please select Parent Class, enter Subject Slug, and Subject Name.');
      return;
    }

    const cleanSlug = newSubSlug.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    if (questionBank.some((s) => s.id === cleanSlug)) {
      setScalingMessage('Error: A subject with this Slug ID already exists.');
      return;
    }

    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    const newSub: Subject = {
      id: cleanSlug,
      name: newSubNameInput.trim(),
      category: parentClassForNewSub,
      hasChapters: true,
      chapters: [
        {
          id: 1,
          title: 'Chapter 1: Fundamentals',
          compositeId: buildCompositeId(parentClassForNewSub, cleanSlug, 1),
          questions: []
        }
      ]
    };

    newBank.push(newSub);
    onUpdateQuestionBank(newBank);

    setScalingMessage(`Success: Added new subject "${newSubNameInput.trim()}" under ${parentClassForNewSub}!`);
    setNewSubSlug('');
    setNewSubNameInput('');
    setTimeout(() => setScalingMessage(''), 4000);
  };

  // ==========================================
  // FEATURE 2: INTERACTIVE MCQ VIEWER & LIVE EDITOR
  // ==========================================
  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;

    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    const sub = newBank.find((s) => s.id === editingQuestion.subjectId);
    if (!sub) return;

    const ch = sub.chapters.find((c) => c.id === editingQuestion.chapterId);
    if (!ch) return;

    const qIdx = ch.questions.findIndex((q) => q.id === editingQuestion.question.id);
    if (qIdx !== -1) {
      ch.questions[qIdx] = editingQuestion.question;
      onUpdateQuestionBank(newBank);
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = (subjectId: string, chapterId: number, questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    const sub = newBank.find((s) => s.id === subjectId);
    if (!sub) return;

    const ch = sub.chapters.find((c) => c.id === chapterId);
    if (!ch) return;

    ch.questions = ch.questions.filter((q) => q.id !== questionId);
    onUpdateQuestionBank(newBank);
  };

  // Requirement 2: Sequential Dropdowns for Manual Add MCQ
  const handleAddSingleQuestion = () => {
    setAddMcqError('');
    if (!addMcqClass || !addMcqSubjectId || !addMcqChapterId) {
      setAddMcqError('Validation Error: You MUST select Class, Subject, and Chapter Number before saving.');
      return;
    }

    if (!newQuestionText.trim() || !newOptA.trim() || !newOptB.trim()) {
      setAddMcqError('Please fill in question statement and at least Option A and Option B.');
      return;
    }

    const newBank = JSON.parse(JSON.stringify(questionBank)) as Subject[];
    let sub = newBank.find((s) => s.id === addMcqSubjectId);
    if (!sub) {
      sub = newBank[0];
    }

    const numChId = Number(addMcqChapterId) || 1;
    if (!sub.chapters || sub.chapters.length === 0) {
      sub.chapters = [{
        id: numChId,
        title: `Chapter ${numChId}`,
        compositeId: buildCompositeId(addMcqClass, sub.name, numChId),
        questions: []
      }];
    }

    let targetChapter = sub.chapters.find((c) => c.id === numChId);
    if (!targetChapter) {
      targetChapter = {
        id: numChId,
        title: `Chapter ${numChId}`,
        compositeId: buildCompositeId(addMcqClass, sub.name, numChId),
        questions: []
      };
      sub.chapters.push(targetChapter);
    }

    const newQ: MCQQuestion = {
      id: `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      q: newQuestionText.trim(),
      opts: [
        newOptA.trim(),
        newOptB.trim(),
        newOptC.trim() || 'None of these',
        newOptD.trim() || 'All of these'
      ],
      ans: newCorrectIndex,
      explain: newExplanation.trim() || `Correct answer is option ${['A', 'B', 'C', 'D'][newCorrectIndex]}`
    };

    targetChapter.questions.push(newQ);
    onUpdateQuestionBank(newBank);

    // Reset form
    setNewQuestionText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewCorrectIndex(0);
    setNewExplanation('');
    setAddMcqError('');
    setIsAddingQuestion(false);
  };

  // Filtered Questions for Viewer
  const filteredQuestions: { subjectName: string; subjectId: string; chapterId: number; chapterTitle: string; question: MCQQuestion }[] = [];

  questionBank.forEach((sub) => {
    if (selectedSubjectFilter !== 'all' && sub.id !== selectedSubjectFilter) return;

    sub.chapters.forEach((ch) => {
      ch.questions.forEach((q) => {
        if (
          searchKeyword.trim() === '' ||
          q.q.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          q.opts.some((o) => o.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          (q.id && q.id.toLowerCase().includes(searchKeyword.toLowerCase()))
        ) {
          filteredQuestions.push({
            subjectName: sub.name,
            subjectId: sub.id,
            chapterId: ch.id,
            chapterTitle: ch.title,
            question: q
          });
        }
      });
    });
  });

  // ==========================================
  // FEATURE 3: SPECIAL TEST SCHEDULER
  // ==========================================
  const handleSaveSpecialTest = () => {
    if (!stTitle.trim() || !stSubjectName.trim() || !stOtpCode.trim()) {
      alert('Please fill in Test Title, Subject, and 6-digit OTP code.');
      return;
    }

    const config: SpecialTestConfig = {
      id: specialTestConfig?.id || `ST_${Date.now()}`,
      title: stTitle.trim(),
      targetClass: stTargetClass,
      subjectName: stSubjectName.trim(),
      startTime: stStartTime,
      endTime: stEndTime,
      otpCode: stOtpCode.trim(),
      questions: stQuestions,
      isActive: stIsActive,
      durationMinutes: stDurationMinutes
    };

    onUpdateSpecialTestConfig(config);
    alert('Special TEST configuration saved successfully!');
  };

  const handleAddQuestionToSpecialTest = (q: MCQQuestion) => {
    if (stQuestions.some((item) => item.q === q.q)) {
      alert('This question is already added to the Special TEST.');
      return;
    }
    setStQuestions([...stQuestions, q]);
  };

  const handleRemoveQuestionFromSpecialTest = (index: number) => {
    const updated = stQuestions.filter((_, i) => i !== index);
    setStQuestions(updated);
  };

  // ==========================================
  // FEATURE 4: CLASS OTPS MANAGEMENT
  // ==========================================
  const handleSaveOtps = () => {
    onUpdateClassOtps({
      middleOtp: middleOtpInput.trim() || '123456',
      ssc9Otp: ssc9OtpInput.trim() || '999999',
      ssc10Otp: ssc10OtpInput.trim() || '101010'
    });
    setOtpSaveSuccess(true);
    setTimeout(() => setOtpSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-900 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span>FCPS Admin Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900 text-white">LIVE</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Question Bank Editor, Special Test Engine & Class OTPs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap gap-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>MCQ Viewer & Live Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'csv'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Bulk CSV & Segregated Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('titles')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'titles'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Title Renamer (IDs vs Titles)</span>
          </button>

          <button
            onClick={() => setActiveTab('scaling')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scaling'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>System Scaling (Add Class/Subject)</span>
          </button>

          <button
            onClick={() => setActiveTab('special_test')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'special_test'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Special TEST Scheduler</span>
          </button>

          <button
            onClick={() => setActiveTab('otps')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'otps'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Class-Wise OTPs</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: MCQ VIEWER & LIVE EDITOR */}
          {activeTab === 'editor' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Search questions by text or keyword..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-800 font-medium"
                    />
                  </div>

                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full sm:w-56 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-800 font-semibold text-slate-800"
                  >
                    <option value="all">All Subjects ({questionBank.length})</option>
                    {questionBank.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAddingQuestion(true)}
                  className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New MCQ</span>
                </button>
              </div>

              {/* Add Single Question Modal / Form */}
              {isAddingQuestion && (
                <div className="p-5 bg-red-50/60 border-2 border-red-500 rounded-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2">
                    <h4 className="text-sm font-black text-red-900 uppercase">Create Single New Question</h4>
                    <button
                      onClick={() => {
                        setIsAddingQuestion(false);
                        setAddMcqError('');
                      }}
                      className="text-gray-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Sequential Dropdowns: Requirement 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        1. Select Class <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={addMcqClass}
                        onChange={(e) => {
                          setAddMcqClass(e.target.value);
                          setAddMcqSubjectId('');
                          setAddMcqChapterId('');
                          setAddMcqError('');
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-800 focus:outline-none focus:border-rose-600"
                      >
                        <option value="">-- Select Class --</option>
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        2. Select Subject <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={addMcqSubjectId}
                        disabled={!addMcqClass}
                        onChange={(e) => {
                          setAddMcqSubjectId(e.target.value);
                          setAddMcqChapterId('');
                          setAddMcqError('');
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-rose-600"
                      >
                        <option value="">{addMcqClass ? '-- Select Subject --' : 'First select class'}</option>
                        {questionBank
                          .filter((s) => s.category === addMcqClass || s.id.startsWith(addMcqClass) || (addMcqClass === 'gk_iq' && s.category === 'gk_iq'))
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-800 mb-1">
                        3. Select Chapter <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={addMcqChapterId}
                        disabled={!addMcqSubjectId}
                        onChange={(e) => {
                          setAddMcqChapterId(e.target.value);
                          setAddMcqError('');
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-rose-600"
                      >
                        <option value="">{addMcqSubjectId ? '-- Select Chapter --' : 'First select subject'}</option>
                        {(() => {
                          const selectedSub = questionBank.find((s) => s.id === addMcqSubjectId);
                          if (!selectedSub || !selectedSub.chapters || selectedSub.chapters.length === 0) {
                            return <option value="1">Chapter 1</option>;
                          }
                          return selectedSub.chapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.title || `Chapter ${ch.id}`}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>

                  {addMcqError && (
                    <div className="p-2.5 bg-red-100 text-red-900 border border-red-300 rounded-md font-bold text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{addMcqError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Question Statement</label>
                    <textarea
                      rows={2}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g. What is the derivative of x^2?"
                      className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block font-bold text-gray-600">Option A</label>
                      <input
                        type="text"
                        value={newOptA}
                        onChange={(e) => setNewOptA(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600">Option B</label>
                      <input
                        type="text"
                        value={newOptB}
                        onChange={(e) => setNewOptB(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600">Option C</label>
                      <input
                        type="text"
                        value={newOptC}
                        onChange={(e) => setNewOptC(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600">Option D</label>
                      <input
                        type="text"
                        value={newOptD}
                        onChange={(e) => setNewOptD(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Correct Answer Index</label>
                      <select
                        value={newCorrectIndex}
                        onChange={(e) => setNewCorrectIndex(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-gray-300 rounded-md font-bold text-red-700"
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Explanation (Optional)</label>
                      <input
                        type="text"
                        value={newExplanation}
                        onChange={(e) => setNewExplanation(e.target.value)}
                        placeholder="Detailed solution..."
                        className="w-full p-2 bg-white border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddSingleQuestion}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Save & Add Question To Bank
                  </button>
                </div>
              )}

              {/* Questions Count Summary */}
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Questions Loaded: {filteredQuestions.length} items</span>
                <span>Sorted by Subject</span>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium">
                    No questions match your filter criteria.
                  </div>
                ) : (
                  filteredQuestions.map((item, idx) => {
                    const isEditing = editingQuestion?.question.id === item.question.id;

                    if (isEditing && editingQuestion) {
                      return (
                        <div key={item.question.id || idx} className="p-4 bg-yellow-50 border-2 border-yellow-500 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-yellow-900 uppercase">Live Edit MCQ</h4>

                          <input
                            type="text"
                            value={editingQuestion.question.q}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                question: { ...editingQuestion.question, q: e.target.value }
                              })
                            }
                            className="w-full p-2 text-xs font-bold bg-white border border-yellow-300 rounded"
                          />

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {editingQuestion.question.opts.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-1.5">
                                <span className="font-bold w-4 text-gray-500">
                                  {['A', 'B', 'C', 'D'][oIdx]}:
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updatedOpts = [...editingQuestion.question.opts];
                                    updatedOpts[oIdx] = e.target.value;
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      question: { ...editingQuestion.question, opts: updatedOpts }
                                    });
                                  }}
                                  className="flex-1 p-1.5 text-xs bg-white border border-gray-300 rounded"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <label className="font-bold text-gray-700">Correct Answer:</label>
                            <select
                              value={editingQuestion.question.ans}
                              onChange={(e) =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  question: { ...editingQuestion.question, ans: Number(e.target.value) }
                                })
                              }
                              className="p-1.5 bg-white border border-gray-300 rounded font-bold text-red-700"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>

                            <button
                              onClick={handleSaveEditQuestion}
                              className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingQuestion(null)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.question.id || idx}
                        className="p-3.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl space-y-2 text-xs transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                                {item.subjectName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: {item.question.id || `q_${idx}`}
                              </span>
                            </div>
                            <p className="font-bold text-gray-900 leading-snug">
                              Q{idx + 1}. {item.question.q}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                setEditingQuestion({
                                  subjectId: item.subjectId,
                                  chapterId: item.chapterId,
                                  question: { ...item.question }
                                })
                              }
                              className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold cursor-pointer transition-colors"
                              title="Edit Question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteQuestion(item.subjectId, item.chapterId, item.question.id || '')
                              }
                              className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-bold cursor-pointer transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px]">
                          {item.question.opts.map((opt, oIdx) => {
                            const isCorrect = item.question.ans === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`p-1.5 rounded border ${
                                  isCorrect
                                    ? 'bg-green-50 border-green-400 font-bold text-green-900'
                                    : 'bg-gray-50 border-gray-200 text-gray-600'
                                }`}
                              >
                                {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BULK CSV & JSON EXPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-6">
              {/* Requirement 3: Smart Segregated CSV Generator */}
              <div className="bg-indigo-50/80 border border-indigo-200 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-indigo-950 font-black text-sm uppercase">
                  <Download className="w-5 h-5 text-indigo-800" />
                  <span>1. Smart Segregated CSV Template Generator</span>
                </div>
                <p className="text-xs text-indigo-900 font-semibold">
                  Select a Class and Subject to generate a pre-configured CSV template with Class, Subject, and Chapter columns pre-filled.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Target Class</label>
                    <select
                      value={csvConfigClass}
                      onChange={(e) => {
                        setCsvConfigClass(e.target.value);
                        setCsvConfigSubject(
                          questionBank.find((s) => s.category === e.target.value || s.id.startsWith(e.target.value))?.id || questionBank[0]?.id || ''
                        );
                      }}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
                    >
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Target Subject</label>
                    <select
                      value={csvConfigSubject}
                      onChange={(e) => setCsvConfigSubject(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
                    >
                      {questionBank
                        .filter((s) => s.category === csvConfigClass || s.id.startsWith(csvConfigClass) || (csvConfigClass === 'gk_iq' && s.category === 'gk_iq'))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Chapter Index</label>
                    <input
                      type="number"
                      min={1}
                      value={csvConfigChapter}
                      onChange={(e) => setCsvConfigChapter(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleGenerateClassSpecificCSV}
                    className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate Segregated CSV Template ({classesList.find((c) => c.id === csvConfigClass)?.name || csvConfigClass})</span>
                  </button>

                  <button
                    onClick={handleDownloadBlankCSV}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Generic Blank CSV
                  </button>
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-xl space-y-4 text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-800 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">2. Upload Filled CSV File</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    Select your populated CSV file. Rows will be parsed using <code>papaparse</code> and merged into the active question bank with dynamic composite IDs.
                  </p>
                </div>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUploadCSV}
                  className="block w-full max-w-xs mx-auto text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 cursor-pointer"
                />

                {csvStatusMessage && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-700" />
                    <span>{csvStatusMessage}</span>
                  </div>
                )}

                {csvErrorMessage && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{csvErrorMessage}</span>
                  </div>
                )}
              </div>

              <div className="bg-indigo-950 text-white p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-black text-sm uppercase">
                  <FileJson className="w-5 h-5 text-sky-400" />
                  <span>3. Export Complete Database to tests.json</span>
                </div>
                <p className="text-xs text-indigo-200 font-medium">
                  Export all active question banks, special test configurations, and class OTP rules to a local <code>tests.json</code> file for backup or deployment.
                </p>
                <button
                  onClick={handleExportToTestsJson}
                  className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <FileJson className="w-4 h-4 text-sky-300" />
                  <span>Export Data to tests.json</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DATA ABSTRACTION & TITLE RENAMER (Requirement 5) */}
          {activeTab === 'titles' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-900" />
                    <span>Presentation Title & Abstraction Editor</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Safely update user-facing titles for Classes, Subjects, and Chapters without modifying underlying static database IDs (e.g. <code className="font-mono text-indigo-800 bg-indigo-50 px-1 py-0.5 rounded">ssc9_maths</code>). All saved test results and OTPs remain 100% intact.
                  </p>
                </div>

                {titleMessage && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-bold rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>{titleMessage}</span>
                  </div>
                )}

                {/* Rename Class Display Title */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase text-xs">1. Rename Class Display Name</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Select Target Class</label>
                      <select
                        value={renameTargetClassId}
                        onChange={(e) => {
                          setRenameTargetClassId(e.target.value);
                          const cls = classesList.find((c) => c.id === e.target.value);
                          if (cls) setNewClassTitle(cls.name);
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Static ID: {c.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">New Presentation Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newClassTitle}
                          onChange={(e) => setNewClassTitle(e.target.value)}
                          placeholder="e.g., SSC Part 1 (Grade 9)"
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                        />
                        <button
                          onClick={handleSaveClassTitle}
                          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rename Subject Display Title */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase text-xs">2. Rename Subject Display Title</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Select Target Subject</label>
                      <select
                        value={renameTargetSubjectId}
                        onChange={(e) => {
                          setRenameTargetSubjectId(e.target.value);
                          const sub = questionBank.find((s) => s.id === e.target.value);
                          if (sub) setNewSubjectTitle(sub.name);
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        {questionBank.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Static ID: {s.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">New Presentation Title</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubjectTitle}
                          onChange={(e) => setNewSubjectTitle(e.target.value)}
                          placeholder="e.g., Advanced Mathematics & Geometry"
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                        />
                        <button
                          onClick={handleSaveSubjectTitle}
                          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rename Chapter Display Title */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase text-xs">3. Rename Chapter Display Title</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                      <select
                        value={renameTargetChapterSubId}
                        onChange={(e) => {
                          setRenameTargetChapterSubId(e.target.value);
                          const sub = questionBank.find((s) => s.id === e.target.value);
                          if (sub && sub.chapters && sub.chapters[0]) {
                            setRenameTargetChapterId(sub.chapters[0].id);
                            setNewChapterTitle(sub.chapters[0].title);
                          }
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        {questionBank.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Chapter Index</label>
                      <select
                        value={renameTargetChapterId}
                        onChange={(e) => {
                          const chNum = Number(e.target.value);
                          setRenameTargetChapterId(chNum);
                          const sub = questionBank.find((s) => s.id === renameTargetChapterSubId);
                          const ch = sub?.chapters.find((c) => c.id === chNum);
                          if (ch) setNewChapterTitle(ch.title);
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        {(() => {
                          const sub = questionBank.find((s) => s.id === renameTargetChapterSubId);
                          return sub?.chapters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title || `Chapter ${c.id}`}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">New Chapter Title</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          placeholder="e.g., Chapter 1: Algebraic Expressions"
                          className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                        />
                        <button
                          onClick={handleSaveChapterTitle}
                          className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC SYSTEM SCALING (Requirement 6) */}
          {activeTab === 'scaling' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-900" />
                    <span>Dynamic System Scaling & Infrastructure Panel</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Expand the assessment portal by registering new academic Classes and Subjects dynamically. Newly added classes and subjects immediately reflect across all student portals, OTP rules, and MCQ test engines.
                  </p>
                </div>

                {scalingMessage && (
                  <div
                    className={`p-3 text-xs font-bold rounded-lg flex items-center gap-2 ${
                      scalingMessage.startsWith('Error')
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-indigo-50 border border-indigo-200 text-indigo-950'
                    }`}
                  >
                    {scalingMessage.startsWith('Error') ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0" />
                    )}
                    <span>{scalingMessage}</span>
                  </div>
                )}

                {/* Add New Academic Class */}
                <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-extrabold text-indigo-950 uppercase text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-800" />
                    <span>1. Register New Academic Class</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Class Display Name <span className="text-indigo-800">*</span>
                      </label>
                      <input
                        type="text"
                        value={newClassNameInput}
                        onChange={(e) => {
                          setNewClassNameInput(e.target.value);
                          if (!newClassSlug) {
                            setNewClassSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                          }
                        }}
                        placeholder="e.g. FSc Part 1 (Pre-Medical)"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Class Slug ID (Static System Identifier) <span className="text-indigo-800">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newClassSlug}
                          onChange={(e) => setNewClassSlug(e.target.value)}
                          placeholder="e.g. fsc_part1"
                          className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                        <button
                          onClick={handleAddClassToSystem}
                          className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                        >
                          Add Class
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add New Subject under Class */}
                <div className="p-5 bg-sky-50/50 border border-sky-200 rounded-xl space-y-3 text-xs">
                  <h4 className="font-extrabold text-sky-950 uppercase text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-sky-800" />
                    <span>2. Register New Subject under Class</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Parent Class <span className="text-indigo-800">*</span>
                      </label>
                      <select
                        value={parentClassForNewSub}
                        onChange={(e) => setParentClassForNewSub(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subject Title <span className="text-indigo-800">*</span>
                      </label>
                      <input
                        type="text"
                        value={newSubNameInput}
                        onChange={(e) => {
                          setNewSubNameInput(e.target.value);
                          if (!newSubSlug) {
                            setNewSubSlug(`${parentClassForNewSub}_${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
                          }
                        }}
                        placeholder="e.g. Organic Chemistry"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subject Slug ID <span className="text-indigo-800">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubSlug}
                          onChange={(e) => setNewSubSlug(e.target.value)}
                          placeholder="e.g. fsc1_chemistry"
                          className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                        <button
                          onClick={handleAddSubjectToSystem}
                          className="px-4 py-2.5 bg-sky-900 hover:bg-sky-950 text-white font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                        >
                          Add Subject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Classes & Subjects Summary Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-3 font-extrabold text-slate-900 uppercase">
                    Active Registered System Classes & Subjects ({classesList.length} Classes, {questionBank.length} Subjects)
                  </div>
                  <div className="divide-y divide-slate-200 bg-white">
                    {classesList.map((c) => {
                      const subs = questionBank.filter((s) => s.category === c.id || s.id.startsWith(c.id));
                      return (
                        <div key={c.id} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-slate-900">{c.name}</span>
                            <span className="ml-2 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              ID: {c.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {subs.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic">No subjects registered yet</span>
                            ) : (
                              subs.map((s) => (
                                <span
                                  key={s.id}
                                  className="text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md"
                                >
                                  {s.name} ({s.chapters.length} Ch)
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIAL TEST SCHEDULER & ANNOUNCEMENT ENGINE */}
          {activeTab === 'special_test' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
                  <div>
                    <h3 className="text-base font-black text-indigo-950 uppercase tracking-tight">
                      Special TEST Scheduler & Announcement Engine
                    </h3>
                    <p className="text-xs text-indigo-900 font-medium">
                      Configure timed, secure Special CLASS TESTs. When active, a dynamic announcement banner appears at the top of the student panel.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-indigo-950 uppercase">Status:</label>
                    <button
                      onClick={() => setStIsActive(!stIsActive)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                        stIsActive ? 'bg-indigo-900 text-white shadow-xs' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {stIsActive ? 'ACTIVE / ANNOUNCED' : 'INACTIVE'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Test Title</label>
                    <input
                      type="text"
                      value={stTitle}
                      onChange={(e) => setStTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Target Class / Section</label>
                    <select
                      value={stTargetClass}
                      onChange={(e) => setStTargetClass(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold"
                    >
                      <option value="Middle Section (Class 6-8)">Middle Section (Class 6-8)</option>
                      <option value="9th Class">SSC Part 1 (9th Class)</option>
                      <option value="10th Class">SSC Part 2 (10th Class)</option>
                      <option value="All Classes">All Classes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Subject / Coverage Title</label>
                    <input
                      type="text"
                      value={stSubjectName}
                      onChange={(e) => setStSubjectName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">6-Digit Passcode / OTP Code</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={stOtpCode}
                      onChange={(e) => setStOtpCode(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg font-mono font-black text-indigo-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Start Time (Date & Time)</label>
                    <input
                      type="datetime-local"
                      value={stStartTime}
                      onChange={(e) => setStStartTime(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">End Time (Date & Time)</label>
                    <input
                      type="datetime-local"
                      value={stEndTime}
                      onChange={(e) => setStEndTime(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Question Selection for Special Test */}
                <div className="space-y-3 pt-3 border-t border-indigo-200">
                  <h4 className="text-xs font-black text-indigo-950 uppercase">
                    Assigned Questions for Special TEST ({stQuestions.length} selected)
                  </h4>
                  <p className="text-[11px] text-indigo-900">
                    Special TESTs use ONLY the exact questions assigned below (no random fetch formula).
                  </p>

                  <div className="flex items-center gap-2">
                    <select
                      value={stSelectedSubjectForPick}
                      onChange={(e) => setStSelectedSubjectForPick(e.target.value)}
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                    >
                      {questionBank.map((s) => (
                        <option key={s.id} value={s.id}>
                          Pick from: {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pickable questions */}
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-3 rounded-lg border border-gray-200 text-xs">
                    {questionBank
                      .find((s) => s.id === stSelectedSubjectForPick)
                      ?.chapters.flatMap((c) => c.questions)
                      .map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <span className="font-medium text-gray-800 truncate max-w-md">{q.q}</span>
                          <button
                            onClick={() => handleAddQuestionToSpecialTest(q)}
                            className="px-2.5 py-1 bg-indigo-900 text-white font-bold rounded text-[10px] hover:bg-indigo-950 cursor-pointer"
                          >
                            + Add to Test
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* List of currently assigned questions */}
                  {stQuestions.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-gray-700 uppercase">Selected Questions List:</span>
                      <div className="max-h-36 overflow-y-auto space-y-1 bg-gray-50 p-2 rounded border border-gray-200 text-xs">
                        {stQuestions.map((sq, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between p-1.5 bg-white rounded border border-gray-200">
                            <span className="font-semibold text-gray-900 truncate">
                              {sIdx + 1}. {sq.q}
                            </span>
                            <button
                              onClick={() => handleRemoveQuestionFromSpecialTest(sIdx)}
                              className="text-amber-800 hover:text-amber-950 font-bold text-[10px] px-2 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveSpecialTest}
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Special TEST Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CLASS-WISE OTPS */}
          {activeTab === 'otps' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl space-y-5">
                <div>
                  <h3 className="text-base font-black text-gray-900 uppercase">Class-Specific Student Access OTPs</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Issue distinct 6-digit OTP passcodes for Middle Section, 9th Class, and 10th Class students.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-gray-900 block uppercase">Middle Section (6-8)</span>
                    <input
                      type="text"
                      maxLength={10}
                      value={middleOtpInput}
                      onChange={(e) => setMiddleOtpInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg font-mono font-bold text-indigo-950 text-center text-sm"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Default: 123456</span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-gray-900 block uppercase">SSC Part 1 (9th Class)</span>
                    <input
                      type="text"
                      maxLength={10}
                      value={ssc9OtpInput}
                      onChange={(e) => setSsc9OtpInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg font-mono font-bold text-indigo-950 text-center text-sm"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Default: 999999</span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-gray-900 block uppercase">SSC Part 2 (10th Class)</span>
                    <input
                      type="text"
                      maxLength={10}
                      value={ssc10OtpInput}
                      onChange={(e) => setSsc10OtpInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg font-mono font-bold text-indigo-950 text-center text-sm"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Default: 101010</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveOtps}
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Class-Wise OTPs</span>
                </button>

                {otpSaveSuccess && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-bold rounded-lg text-center">
                    Class-Wise OTP Passcodes updated successfully!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-200 p-4 flex items-center justify-between text-xs text-gray-500 font-semibold shrink-0">
          <span>FCPS Academic Systems • Admin Panel v2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer"
          >
            Close Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};
