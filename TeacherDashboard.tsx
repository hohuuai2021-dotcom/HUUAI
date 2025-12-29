import React, { useState } from 'react';
import FileUploader from './FileUploader';
import { AppData } from '../types';
import { processSampleQuestions } from '../services/geminiService';
import { DATA_FILES } from '../constants';

interface TeacherDashboardProps {
  data: AppData;
  onUpdate: (newData: Partial<AppData>) => void;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ data, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'class' | 'exam' | 'subject' | 'questions'>('class');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClassScheduleUpload = (content: string) => {
    onUpdate({ classSchedule: content });
    setStatusMessage("Class schedule updated successfully!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExamScheduleUpload = (content: string) => {
    onUpdate({ examSchedule: content });
    setStatusMessage("Exam schedule updated successfully!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSubjectContentUpload = (content: string) => {
    onUpdate({ subjectContent: content });
    setStatusMessage("Subject content updated successfully!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleQuestionUpload = async (content: string) => {
    setIsProcessing(true);
    setStatusMessage("AI is processing the questions file. This may take a moment...");
    try {
      const processedContent = await processSampleQuestions(content);
      if (processedContent) {
        // Append or Replace? Let's append with a separator for this session
        const newKnowledgeBase = data.knowledgeBase 
          ? `${data.knowledgeBase}\n\n--- IMPORTED UPDATE ---\n${processedContent}`
          : processedContent;
          
        onUpdate({ knowledgeBase: newKnowledgeBase });
        setStatusMessage("Questions processed and imported into knowledge base!");
      } else {
        setStatusMessage("Failed to process content.");
      }
    } catch (e) {
      setStatusMessage("Error during AI processing.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl shadow-sky-100 border border-slate-100">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
          <p className="text-slate-500">Manage schedules, subject info, and chatbot knowledge.</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg ${isProcessing ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-green-50 text-green-800 border-green-200'} border`}>
          <div className="flex items-center gap-2">
             {isProcessing && <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>}
             {statusMessage}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'class' ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class Schedule
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'exam' ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Exam Schedule
        </button>
        <button
          onClick={() => setActiveTab('subject')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'subject' ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Subject Info
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'questions' ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Q&A Import
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        {activeTab === 'class' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Class Schedule</h3>
            <FileUploader
              label="Upload Class Schedule (.txt)"
              description="Upload the master text file containing class timetables."
              onFileRead={handleClassScheduleUpload}
              downloadSampleFileName="sample_class_schedule.txt"
              sampleContentUrl={DATA_FILES.classSchedule}
            />
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Data Preview:</h4>
              <div className="bg-white p-4 rounded border border-slate-200 h-48 overflow-y-auto font-mono text-xs text-slate-600">
                {data.classSchedule || "No data uploaded."}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exam' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Update Exam Schedule</h3>
            <FileUploader
              label="Upload Exam Schedule (.txt)"
              description="Upload the file containing exam dates and times."
              onFileRead={handleExamScheduleUpload}
              downloadSampleFileName="sample_exam_schedule.txt"
              sampleContentUrl={DATA_FILES.examSchedule}
            />

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Data Preview:</h4>
              <div className="bg-white p-4 rounded border border-slate-200 h-48 overflow-y-auto font-mono text-xs text-slate-600">
                {data.examSchedule || "No data uploaded."}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subject' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Subject Information & Review</h3>
            <FileUploader
              label="Upload Subject Content (.txt)"
              description="Upload key concepts, formulas, or review summaries (e.g., Physics definitions). The AI will prioritize this file."
              onFileRead={handleSubjectContentUpload}
              downloadSampleFileName="sample_subject_content.txt"
              sampleContentUrl={DATA_FILES.subjectContent}
            />
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
                <strong>Note:</strong> The Chatbot is also enabled to use its general AI knowledge to answer study-related questions for this subject (e.g., explaining concepts not explicitly in the file), but it will ignore non-educational topics.
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Data Preview:</h4>
              <div className="bg-white p-4 rounded border border-slate-200 h-48 overflow-y-auto font-mono text-xs text-slate-600">
                {data.subjectContent || "No subject content uploaded."}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Import Sample Questions</h3>
            <FileUploader
              label="Upload Raw Q&A File (.txt)"
              description="Upload a raw text file of questions/topics. The AI will process this to update the chatbot's knowledge base."
              onFileRead={handleQuestionUpload}
            />
            
            {isProcessing && (
               <div className="mt-4 text-sky-600 text-sm animate-pulse">
                 Processing content with Gemini... Please wait.
               </div>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Knowledge Base:</h4>
              <div className="bg-white p-4 rounded border border-slate-200 h-48 overflow-y-auto font-mono text-xs text-slate-600">
                {data.knowledgeBase || "No additional knowledge imported."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;