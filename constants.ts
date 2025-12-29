import { TeacherConfig } from "./types";

// Hardcoded configuration as requested
export const TEACHER_CONFIG: TeacherConfig = {
  username: "admin",
  password: "password123"
};

export const APP_STORAGE_KEY = 'edubot_data_v1';

// Data file paths (loaded from public/data/)
export const DATA_FILES = {
  classSchedule: '/data/class_schedule.txt',
  examSchedule: '/data/exam_schedule.txt',
  subjectContent: '/data/subject_content.txt'
};

export const MAX_FILE_SIZE_CHARS = 20000; // Limit specifically mentioned in prompt to keep system prompt manageable

export const MAX_CHAT_QUESTIONS = 15; // Limit conversation length
