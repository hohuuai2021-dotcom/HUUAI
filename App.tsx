import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import TeacherDashboard from './components/TeacherDashboard';
import Login from './components/Login';
import { Role, AppData } from './types';
import { APP_STORAGE_KEY } from './constants';
import { loadDefaultData } from './services/dataLoader';

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const initializeData = async () => {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      if (savedData) {
        try {
          setAppData(JSON.parse(savedData));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
      // No localStorage data, load from files
      const defaultData = await loadDefaultData();
      setAppData(defaultData as AppData);
      setIsLoading(false);
    };
    initializeData();
  }, []);

  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [showLogin, setShowLogin] = useState(false);

  // Persistence: Save to localStorage whenever appData changes
  useEffect(() => {
    if (appData) {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
    }
  }, [appData]);

  // Handle data updates from Teacher Dashboard
  const handleDataUpdate = (newData: Partial<AppData>) => {
    setAppData(prev => prev ? { ...prev, ...newData } : null);
  };

  if (isLoading || !appData) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-sky-600">Loading...</div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setCurrentRole('teacher');
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentRole('student');
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans">
      {/* Navigation / Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-sky-500 to-blue-500 text-white p-1.5 rounded-xl shadow-lg shadow-sky-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">EduBot Manager</span>
            </div>
            
            <div className="flex items-center">
              {currentRole === 'student' ? (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1 hover:bg-sky-50 px-3 py-2 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Teacher Login
                </button>
              ) : (
                <div className="flex items-center gap-2">
                   <span className="text-sm text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200 font-medium">Logged in as Teacher</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'teacher' ? (
          <TeacherDashboard 
            data={appData} 
            onUpdate={handleDataUpdate}
            onLogout={handleLogout}
          />
        ) : (
          <div className="space-y-8">
             <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">School Schedule Assistant</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Ask questions about your class schedule, upcoming exams, or subject topics.
                  The content is updated by your teachers.
                </p>
             </div>
             <ChatInterface appData={appData} />
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default App;