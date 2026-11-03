export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type AssignmentStatus = 'not-started' | 'in-progress' | 'completed';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO string or YYYY-MM-DD
  dueTime?: string;
  estimatedMinutes: number;
  priority: Priority;
  status: AssignmentStatus;
  description: string;
  checklist: Subtask[];
  tags: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  accentHex: string;
  teacher?: string;
}

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  hint?: string;
  mastery: 'new' | 'learning' | 'mastered';
}

export type TutorMode = 'step-by-step' | 'socratic' | 'explain' | 'essay-coach' | 'quiz';

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  timestamp: string;
  mode?: TutorMode;
  subject?: string;
}

export interface FormulaSnippet {
  id: string;
  subject: string;
  title: string;
  latex: string;
  description: string;
  variables: { name: string; desc: string }[];
  example?: string;
}

export interface StudyLog {
  id: string;
  timestamp: string;
  minutes: number;
  assignmentTitle: string;
  subject: string;
}
