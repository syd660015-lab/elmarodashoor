
export interface Tafila {
  text: string;
  pattern: string;
}

export interface ProsodyAnalysis {
  original: string;
  diacritized: string;
  prosodicWriting: string;
  symbols: string;
  meterName: string;
  tafilat: Tafila[];
  explanation?: string;
}

export interface HistoryItem extends ProsodyAnalysis {
  id: string;
  timestamp: number;
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number; // 0 to 100
  errorTafilaIndex?: number;
  feedback: string;
  correctedPattern: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface AssessmentData {
  quiz: QuizQuestion[];
}

// Database Schema Interfaces
export interface MeterInfo {
  name: string;
  originalTafilat: string;
  acceptedZihafat: string[];
  acceptedIlal: string[];
}

export interface ArudSkill {
  id: string;
  description: string;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
}

export interface StudentStats {
  interactionsCount: number;
  strengths: string[]; // Meter names the student is good at
  recurringErrors: {
    meterName: string;
    errorCount: number;
  }[];
  completedQuizzes: number;
  averageScore: number;
  meterCounts: { [meterName: string]: number };
}

export interface AnalysisError {
  message: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
