// EXPORTS: IChatSession, IChatMessage, ITermHighlight, IQuizRecord, IAnswerRecord, IWrongAnswer, ILeaderboardEntry, IRecognitionRecord,
//          loadChatHistory, saveChatHistory, deleteChatSession, loadQuizRecords, saveQuizRecord, loadWrongAnswers, saveWrongAnswer,
//          deleteWrongAnswer, clearWrongAnswers, loadLeaderboard, saveLeaderboardEntry, loadRecognitionHistory, saveRecognitionRecord

import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

// ==================== 类型定义 ====================

export interface ITermHighlight {
  term: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedQuestions?: string[];
  highlightedTerms?: ITermHighlight[];
}

export interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface IAnswerRecord {
  questionIndex: number;
  question: string;
  questionType: 'choice' | 'truefalse' | 'fillblank' | 'image';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  aiExplanation?: string;
  knowledgePoint?: string;
}

export interface IQuizRecord {
  id: string;
  date: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  answers: IAnswerRecord[];
  learningAdvice?: string;
}

export interface IWrongAnswer {
  id: string;
  quizRecordId: string;
  date: string;
  question: string;
  questionType: 'choice' | 'truefalse' | 'fillblank' | 'image';
  userAnswer: string;
  correctAnswer: string;
  aiExplanation?: string;
  knowledgePoint: string;
}

export interface ILeaderboardEntry {
  date: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
}

export interface IRecognitionRecord {
  id: string;
  imageUrl: string;
  mountainName: string;
  confidence: number;
  landformType: string;
  elevation: number;
  location: string;
  timestamp: string;
}

// ==================== 存储键名 ====================

const KEYS = {
  CHAT_HISTORY: '__global_wanshan_chat_history',
  QUIZ_RECORDS: '__global_wanshan_quiz_records',
  WRONG_ANSWERS: '__global_wanshan_wrong_answers',
  LEADERBOARD: '__global_wanshan_leaderboard',
  RECOGNITION_HISTORY: '__global_wanshan_recognition_history',
} as const;

// ==================== 通用工具 ====================

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  scopedStorage.setItem(key, JSON.stringify(value));
}

// ==================== 对话历史 ====================

export function loadChatHistory(): IChatSession[] {
  return readJson<IChatSession[]>(KEYS.CHAT_HISTORY, []);
}

export function saveChatHistory(sessions: IChatSession[]): void {
  writeJson(KEYS.CHAT_HISTORY, sessions);
}

export function deleteChatSession(sessionId: string): void {
  const sessions = loadChatHistory();
  const updated = sessions.filter((s) => s.id !== sessionId);
  saveChatHistory(updated);
}

// ==================== 测验成绩 ====================

export function loadQuizRecords(): IQuizRecord[] {
  return readJson<IQuizRecord[]>(KEYS.QUIZ_RECORDS, []);
}

export function saveQuizRecord(record: IQuizRecord): void {
  const records = loadQuizRecords();
  records.unshift(record);
  writeJson(KEYS.QUIZ_RECORDS, records);
}

// ==================== 错题本 ====================

export function loadWrongAnswers(): IWrongAnswer[] {
  return readJson<IWrongAnswer[]>(KEYS.WRONG_ANSWERS, []);
}

export function saveWrongAnswer(answer: IWrongAnswer): void {
  const answers = loadWrongAnswers();
  answers.unshift(answer);
  writeJson(KEYS.WRONG_ANSWERS, answers);
}

export function deleteWrongAnswer(answerId: string): void {
  const answers = loadWrongAnswers();
  const updated = answers.filter((a) => a.id !== answerId);
  writeJson(KEYS.WRONG_ANSWERS, updated);
}

export function clearWrongAnswers(): void {
  writeJson(KEYS.WRONG_ANSWERS, []);
}

// ==================== 排行榜 ====================

export function loadLeaderboard(): ILeaderboardEntry[] {
  return readJson<ILeaderboardEntry[]>(KEYS.LEADERBOARD, []);
}

export function saveLeaderboardEntry(entry: ILeaderboardEntry): void {
  const board = loadLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  writeJson(KEYS.LEADERBOARD, board.slice(0, 50));
}

// ==================== 图像识别历史 ====================

export function loadRecognitionHistory(): IRecognitionRecord[] {
  return readJson<IRecognitionRecord[]>(KEYS.RECOGNITION_HISTORY, []);
}

export function saveRecognitionRecord(record: IRecognitionRecord): void {
  const history = loadRecognitionHistory();
  history.unshift(record);
  writeJson(KEYS.RECOGNITION_HISTORY, history.slice(0, 20));
}
