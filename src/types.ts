export interface MCQQuestion {
  id: string;
  q: string;
  opts: string[];
  ans: number; // 0-based index
  explain?: string;
  chapterTitle?: string;
  subjectId?: string;
  test_type?: string;
}

export interface SystemClass {
  id: string;
  name: string;
  categorySlug: string;
}

export interface Chapter {
  id: number;
  title: string;
  compositeId?: string;
  questions: MCQQuestion[];
}

export interface Subject {
  id: string;
  name: string;
  category: string; // 'middle' | 'ssc9' | 'ssc10' | 'gk_iq' | 'special' or dynamic slug
  hasChapters: boolean;
  chapters: Chapter[];
}

export interface ClassCategory {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface CSVRow {
  subject: string;
  id?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct: string | number; // 'A', 'B', 'C', 'D' or 0,1,2,3
  test_type?: string;
  chapter?: string;
  explain?: string;
}

export interface QuestionFormat {
  id: string;
  subject: string;
  chapter: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  test_type?: string;
}

export interface ClassOtpConfig {
  middleOtp: string;
  ssc9Otp: string;
  ssc10Otp: string;
}

export interface SpecialTestConfig {
  id: string;
  title: string;
  targetClass: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  otpCode: string;
  questions: MCQQuestion[];
  isActive: boolean;
  durationMinutes: number;
}

export interface StudentResultRecord {
  id: string;
  studentName: string;
  studentClass: string;
  subjectName: string;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt?: string;
  timestamp?: string;
  formattedTime?: string;
  otp?: string;
  selectedChapters?: string[];
  wrongAnswers?: number;
  skippedQuestions?: number;
  timeTakenSeconds?: number;
  testType?: 'standard' | 'featured_gk_iq' | 'special_test';
}
