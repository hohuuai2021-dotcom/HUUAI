import { DATA_FILES } from '../constants';
import { AppData } from '../types';

export async function loadDefaultData(): Promise<Partial<AppData>> {
  const [classSchedule, examSchedule, subjectContent] = await Promise.all([
    fetchTextFile(DATA_FILES.classSchedule),
    fetchTextFile(DATA_FILES.examSchedule),
    fetchTextFile(DATA_FILES.subjectContent)
  ]);

  return {
    classSchedule,
    examSchedule,
    subjectContent,
    knowledgeBase: ''
  };
}

async function fetchTextFile(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to load ${path}`);
      return '';
    }
    return await response.text();
  } catch (error) {
    console.warn(`Error loading ${path}:`, error);
    return '';
  }
}

export async function loadSampleContent(type: 'classSchedule' | 'examSchedule' | 'subjectContent'): Promise<string> {
  return fetchTextFile(DATA_FILES[type]);
}
