export type Role = 'student' | 'teacher';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface AppData {
  classSchedule: string;
  examSchedule: string;
  knowledgeBase: string; // Generated from sample questions
  subjectContent: string; // New field for Subject Information (e.g., Physics summary)
}

export interface TeacherConfig {
  username: string;
  password: string; // In a real app, this should be hashed/secure
}

export interface ProcessedFileResult {
  success: boolean;
  content: string;
  message?: string;
}