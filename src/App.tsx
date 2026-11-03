import React, { useState, useEffect } from 'react';
import { Assignment, Flashcard, FormulaSnippet, StudyLog } from './types';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_FLASHCARDS,
  INITIAL_SUBJECTS,
  FORMULA_REFERENCE,
} from './data/initialData';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { AssignmentManager } from './components/AssignmentManager';
import { AITutorPanel } from './components/AITutorPanel';
import { FocusTimer } from './components/FocusTimer';
import { FlashcardReview } from './components/FlashcardReview';
import { FormulaReference } from './components/FormulaReference';
import { NewAssignmentModal } from './components/NewAssignmentModal';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scholarflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scholarflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scholarflow_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'assignments' | 'tutor' | 'timer' | 'flashcards' | 'formulas'
  >('assignments');

  // Homework assignments state
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('scholarflow_assignments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved assignments:', e);
      }
    }
    return INITIAL_ASSIGNMENTS;
  });

  useEffect(() => {
    localStorage.setItem('scholarflow_assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('scholarflow_flashcards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved flashcards:', e);
      }
    }
    return INITIAL_FLASHCARDS;
  });

  useEffect(() => {
    localStorage.setItem('scholarflow_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  // Study logs state
  const [studyMinutesToday, setStudyMinutesToday] = useState<number>(() => {
    const saved = localStorage.getItem('scholarflow_today_minutes');
    return saved ? parseInt(saved, 10) : 75; // Initial authentic baseline
  });

  // Modal & Context states
  const [isNewAssignmentOpen, setIsNewAssignmentOpen] = useState(false);
  const [activeTutorAssignment, setActiveTutorAssignment] = useState<Assignment | null>(null);
  const [activeTimerAssignment, setActiveTimerAssignment] = useState<Assignment | null>(null);

  const subjectNames = INITIAL_SUBJECTS.map((s) => s.name);

  // Assignment handlers
  const handleToggleSubtask = (assignmentId: string, subtaskId: string) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const updatedChecklist = asg.checklist.map((sub) =>
          sub.id === subtaskId ? { ...sub, done: !sub.done } : sub
        );
        const allDone = updatedChecklist.length > 0 && updatedChecklist.every((s) => s.done);
        return {
          ...asg,
          checklist: updatedChecklist,
          status: allDone ? 'completed' : 'in-progress',
        };
      })
    );
  };

  const handleToggleStatus = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;
        const newStatus = asg.status === 'completed' ? 'in-progress' : 'completed';
        const updatedChecklist =
          newStatus === 'completed'
            ? asg.checklist.map((s) => ({ ...s, done: true }))
            : asg.checklist;
        return {
          ...asg,
          status: newStatus,
          checklist: updatedChecklist,
        };
      })
    );
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  const handleAddAssignment = (newAssignment: Assignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  // Cross-component triggers
  const handleOpenTutorForAssignment = (assignment: Assignment) => {
    setActiveTutorAssignment(assignment);
    setActiveTab('tutor');
  };

  const handleStartTimerForAssignment = (assignment: Assignment) => {
    setActiveTimerAssignment(assignment);
    setActiveTab('timer');
  };

  const handleOpenTutorWithPrompt = (promptText: string, subject: string) => {
    setActiveTab('tutor');
    // Set transient prompt via state if needed
  };

  const handleOpenTutorWithFormula = (formula: FormulaSnippet) => {
    setActiveTab('tutor');
  };

  const handleSessionComplete = (minutes: number, assignmentTitle: string, subject: string) => {
    const newTotal = studyMinutesToday + minutes;
    setStudyMinutesToday(newTotal);
    localStorage.setItem('scholarflow_today_minutes', String(newTotal));
  };

  const handleUpdateCardMastery = (cardId: string, mastery: 'new' | 'learning' | 'mastered') => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, mastery } : c))
    );
  };

  const handleAddFlashcard = (newCard: Omit<Flashcard, 'id'>) => {
    const card: Flashcard = {
      ...newCard,
      id: `fc-${Date.now()}`,
    };
    setFlashcards((prev) => [...prev, card]);
  };

  const pendingCount = assignments.filter((a) => a.status !== 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAssignment={() => setIsNewAssignmentOpen(true)}
        isDark={isDark}
        toggleTheme={toggleTheme}
        pendingCount={pendingCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Overview Banner (shown on Assignments view) */}
        {activeTab === 'assignments' && (
          <DashboardOverview
            assignments={assignments}
            onOpenTutorForAssignment={handleOpenTutorForAssignment}
            onStartTimerForAssignment={handleStartTimerForAssignment}
            onOpenNewAssignment={() => setIsNewAssignmentOpen(true)}
            todayStudyMinutes={studyMinutesToday}
          />
        )}

        {/* View Switcher */}
        {activeTab === 'assignments' && (
          <AssignmentManager
            assignments={assignments}
            subjects={subjectNames}
            onToggleSubtask={handleToggleSubtask}
            onToggleStatus={handleToggleStatus}
            onDeleteAssignment={handleDeleteAssignment}
            onOpenTutorForAssignment={handleOpenTutorForAssignment}
            onStartTimerForAssignment={handleStartTimerForAssignment}
            onOpenNewAssignment={() => setIsNewAssignmentOpen(true)}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorPanel
            subjects={subjectNames}
            assignments={assignments}
            activeAssignment={activeTutorAssignment}
            onClearActiveAssignment={() => setActiveTutorAssignment(null)}
          />
        )}

        {activeTab === 'timer' && (
          <FocusTimer
            assignments={assignments}
            activeAssignment={activeTimerAssignment}
            onSessionComplete={handleSessionComplete}
            onOpenTutorForAssignment={handleOpenTutorForAssignment}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardReview
            flashcards={flashcards}
            subjects={subjectNames}
            onUpdateCardMastery={handleUpdateCardMastery}
            onAddCard={handleAddFlashcard}
            onOpenTutorWithPrompt={handleOpenTutorWithPrompt}
          />
        )}

        {activeTab === 'formulas' && (
          <FormulaReference
            formulas={FORMULA_REFERENCE}
            onOpenTutorWithFormula={handleOpenTutorWithFormula}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ScholarFlow · Autonomous Student Homework & Study Companion</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Encouraging Socratic Pedagogy</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>

      {/* New Assignment Modal */}
      <NewAssignmentModal
        isOpen={isNewAssignmentOpen}
        onClose={() => setIsNewAssignmentOpen(false)}
        subjects={subjectNames}
        onAddAssignment={handleAddAssignment}
      />
    </div>
  );
}
