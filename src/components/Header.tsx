import React from 'react';
import { BookOpen, Moon, Sun, Plus, Sparkles, Clock, Layers, HelpCircle, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'assignments' | 'tutor' | 'timer' | 'flashcards' | 'formulas';
  setActiveTab: (tab: 'assignments' | 'tutor' | 'timer' | 'flashcards' | 'formulas') => void;
  onOpenNewAssignment: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAssignment,
  isDark,
  toggleTheme,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('assignments')}
            className="text-left font-bold text-lg tracking-tight text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
          >
            ScholarFlow
          </button>
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'assignments'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Assignments</span>
            {pendingCount > 0 && (
              <span className="font-mono text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                ({pendingCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tutor'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Homework Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timer'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'flashcards'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'formulas'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formulas & Guides</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Theme Toggle + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenNewAssignment}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>

          {/* User Profile avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
            <img
              src="/src/assets/images/student_avatar_profile_1793694012595.jpg"
              alt="Student profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
              referrerPolicy="no-referrer"
            />
            <div className="text-left text-xs hidden lg:block">
              <p className="font-semibold text-neutral-900 dark:text-neutral-200 leading-none">Maya Chen</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">Honors Senior</p>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile nav drawer strip */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-200 dark:border-neutral-800 px-2 py-2 bg-neutral-50 dark:bg-neutral-900">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            activeTab === 'assignments' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            activeTab === 'tutor' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-indigo-500" />
          <span>AI Tutor</span>
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            activeTab === 'timer' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>Focus</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            activeTab === 'flashcards' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            activeTab === 'formulas' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Formulas</span>
        </button>
      </div>
    </header>
  );
};
