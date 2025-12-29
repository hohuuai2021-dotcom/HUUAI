import React, { useState, useEffect, useRef } from 'react';
import { Chat, GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppData, ChatMessage } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { MAX_CHAT_QUESTIONS } from '../constants';

interface ChatInterfaceProps {
  appData: AppData;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ appData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Hé lô các em! 👋 Đây là trợ lý AI siêu cấp của Thầy Hữu Ái nè. \n\nCác em cần hỏi lịch học 📅, lịch thi 📝 hay bài tập gì thì cứ nhắn thầy nha! Nhớ nói rõ **Lớp nào** để thầy check cho chuẩn nhé! 😉'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initChat = () => {
    const session = createChatSession(appData);
    setChatSession(session);
    setQuestionCount(0);
    setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'model',
          text: 'Hé lô các em! 👋 Đây là trợ lý AI siêu cấp của Thầy Hữu Ái nè. \n\nCác em cần hỏi lịch học 📅, lịch thi 📝 hay bài tập gì thì cứ nhắn thầy nha! Nhớ nói rõ **Lớp nào** để thầy check cho chuẩn nhé! 😉'
        }
    ]);
  };

  // Initialize chat session when component mounts or appData changes
  useEffect(() => {
    initChat();
  }, [appData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession || isLoading) return;
    
    // Check limit
    if (questionCount >= MAX_CHAT_QUESTIONS) {
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setQuestionCount(prev => prev + 1);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(chatSession, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Ui da, mạng mẽo chán quá! 😭 Thầy đang mất kết nối xíu, em thử lại sau nha!",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLimitReached = questionCount >= MAX_CHAT_QUESTIONS;

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-sky-100 border border-sky-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-4 text-white flex justify-between items-center">
        <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.512 50.556 50.556 0 0 0-2.658.813m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            Trợ lý Thầy Hữu Ái
            </h2>
            <p className="text-xs text-sky-100 mt-0.5 ml-8">Hỏi đáp lịch học & Kiểm tra</p>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                {questionCount}/{MAX_CHAT_QUESTIONS} câu hỏi
             </span>
            {isLimitReached && (
                <span className="text-xs bg-red-500 px-2 py-1 rounded text-white shadow-sm">Đã hết lượt</span>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-sky-500 text-white rounded-br-none user-message shadow-sky-200'
                  : msg.isError 
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        {isLimitReached ? (
             <div className="text-center">
                 <p className="text-slate-500 mb-2 text-sm">Hic, em đã hỏi hết {MAX_CHAT_QUESTIONS} câu rồi. Reset để hỏi tiếp nha!</p>
                 <button 
                    onClick={initChat}
                    className="bg-sky-500 text-white px-6 py-2 rounded-xl hover:bg-sky-600 transition-colors font-medium text-sm shadow-md shadow-sky-200"
                 >
                    Bắt đầu cuộc hội thoại mới 🔄
                 </button>
             </div>
        ) : (
            <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ví dụ: Lớp 7.1 bao giờ kiểm tra Hóa? 🤔"
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all placeholder:text-slate-400"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-md shadow-sky-200 hover:shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;