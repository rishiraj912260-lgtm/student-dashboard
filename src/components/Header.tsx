import React from 'react';
import {
  GraduationCap,
  Moon,
  Sun,
  Plus,
  Sparkles,
  Timer,
  BookMarked,
  FileCode2,
  CheckSquare,
} from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element wordmark with icon) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-xs transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('assignments')}
            className="text-left font-bold text-lg tracking-tight text-neutral-900 dark:text-neutral-50 hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>ScholarFlow</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold ml-0.5">
              Study OS
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, whitespace-nowrap shrink-0) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'assignments'
                ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Assignments</span>
            {pendingCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums font-semibold px-1.5 py-0.2 rounded bg-neutral-200/70 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'tutor'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
            <span>Socratic Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'timer'
                ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Focus Clock</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'flashcards'
                ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'formulas'
                ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Formulas & Guides</span>
          </button>
        </nav>

        {/* Zone 3: Action Controls + Dual-theme + Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          <button
            onClick={onOpenNewAssignment}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-neutral-200 dark:border-neutral-800">
            <img
              src="/src/assets/images/student_avatar_profile_1793694012595.jpg"
              alt="Maya Chen"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
              referrerPolicy="no-referrer"
            />
            <div className="text-left text-xs hidden xl:block">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 leading-none">Maya Chen</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">GPA: 3.92</p>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-200 dark:border-neutral-800 px-2 py-2 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'assignments' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'tutor' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-indigo-500" />
          <span>AI Tutor</span>
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'timer' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <Timer className="w-4 h-4 mb-0.5" />
          <span>Clock</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'flashcards' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <BookMarked className="w-4 h-4 mb-0.5" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            activeTab === 'formulas' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'
          }`}
        >
          <FileCode2 className="w-4 h-4 mb-0.5" />
          <span>Guides</span>
        </button>
      </div>
    </header>
  );
};
