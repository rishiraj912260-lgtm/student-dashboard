import React, { useState, useMemo } from 'react';
import { Assignment, Priority } from '../types';
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Play,
  Trash2,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AssignmentManagerProps {
  assignments: Assignment[];
  subjects: string[];
  onToggleSubtask: (assignmentId: string, subtaskId: string) => void;
  onToggleStatus: (assignmentId: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onOpenTutorForAssignment: (assignment: Assignment) => void;
  onStartTimerForAssignment: (assignment: Assignment) => void;
  onOpenNewAssignment: () => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  subjects,
  onToggleSubtask,
  onToggleStatus,
  onDeleteAssignment,
  onOpenTutorForAssignment,
  onStartTimerForAssignment,
  onOpenNewAssignment,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'urgent' | 'in-progress' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(assignments[0]?.id || null);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Tab filter
      if (filterTab === 'urgent' && a.priority !== 'urgent' && a.priority !== 'high') return false;
      if (filterTab === 'in-progress' && a.status !== 'in-progress') return false;
      if (filterTab === 'completed' && a.status !== 'completed') return false;
      if (filterTab === 'all' && a.status === 'completed') {
        // Still show completed on 'all', but keep them below
      }

      // Subject filter
      if (selectedSubject !== 'all' && a.subject !== selectedSubject) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchSubject = a.subject.toLowerCase().includes(q);
        const matchDesc = a.description.toLowerCase().includes(q);
        const matchTags = a.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSubject && !matchDesc && !matchTags) return false;
      }

      return true;
    }).sort((a, b) => {
      // Completed items go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      // Sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [assignments, filterTab, selectedSubject, searchQuery]);

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'normal':
        return 'text-neutral-600 dark:text-neutral-400';
      case 'low':
        return 'text-neutral-400 dark:text-neutral-500';
    }
  };

  const formatDueDate = (dateStr: string, timeStr?: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueZero = new Date(dateStr);
    dueZero.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueZero.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let dayText = '';
    if (diffDays === 0) dayText = 'Due Today';
    else if (diffDays === 1) dayText = 'Due Tomorrow';
    else if (diffDays < 0) dayText = `${Math.abs(diffDays)}d Overdue`;
    else dayText = `Due in ${diffDays} days`;

    return `${dayText} (${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${
      timeStr ? ` · ${timeStr}` : ''
    })`;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search, Segmented Filter Buttons, Subject Dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Functional Segmented Controls (allowed per Section 1.A) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All Tasks ({assignments.length})
          </button>
          <button
            onClick={() => setFilterTab('urgent')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'urgent'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Urgent / High
          </button>
          <button
            onClick={() => setFilterTab('in-progress')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'in-progress'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filterTab === 'completed'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
          <AlertCircle className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">No assignments found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedSubject !== 'all' || filterTab !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'You have no homework logged. Add your first assignment to begin tracking.'}
          </p>
          <button
            onClick={() => {
              setFilterTab('all');
              setSelectedSubject('all');
              setSearchQuery('');
              onOpenNewAssignment();
            }}
            className="mt-4 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Create New Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const isExpanded = expandedId === assignment.id;
            const completedSubtasks = assignment.checklist.filter((c) => c.done).length;
            const progress =
              assignment.checklist.length > 0
                ? Math.round((completedSubtasks / assignment.checklist.length) * 100)
                : assignment.status === 'completed'
                ? 100
                : 0;

            const isOverdue =
              assignment.status !== 'completed' &&
              new Date(assignment.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={assignment.id}
                className={`rounded-xl border transition-all ${
                  assignment.status === 'completed'
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 opacity-80'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs'
                }`}
              >
                {/* Main Card Header Row */}
                <div className="p-4 flex items-start justify-between gap-4">
                  {/* Left: Complete toggle + details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleStatus(assignment.id)}
                      className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={assignment.status === 'completed' ? 'Mark in progress' : 'Mark completed'}
                    >
                      {assignment.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Zero-Pill unboxed metadata line */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{assignment.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className={getPriorityStyle(assignment.priority)}>
                          {assignment.priority.toUpperCase()}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-mono ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                          {formatDueDate(assignment.dueDate, assignment.dueTime)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{assignment.estimatedMinutes}m est.</span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 ${
                          assignment.status === 'completed' ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                        }`}
                      >
                        {assignment.title}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>

                      {/* Progress summary bar */}
                      {assignment.checklist.length > 0 && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                            {completedSubtasks}/{assignment.checklist.length} ({progress}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenTutorForAssignment(assignment)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition-colors whitespace-nowrap shrink-0"
                      title="Ask AI tutor to solve or explain this assignment"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Ask Tutor</span>
                    </button>

                    <button
                      onClick={() => onStartTimerForAssignment(assignment)}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors whitespace-nowrap shrink-0"
                      title="Start timed focus session on this assignment"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Focus</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
                      aria-label="Toggle subtasks"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks checklist & Quick Mobile actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-b-xl">
                    <div className="mb-3 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <span>Subtask Breakdown</span>
                      <span className="text-[11px] font-normal text-neutral-500">
                        Check items off as you finish them
                      </span>
                    </div>

                    {assignment.checklist.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No subtasks defined for this assignment.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {assignment.checklist.map((sub) => (
                          <label
                            key={sub.id}
                            className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none group"
                          >
                            <input
                              type="checkbox"
                              checked={sub.done}
                              onChange={() => onToggleSubtask(assignment.id, sub.id)}
                              className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={sub.done ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                              {sub.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Mobile button strip */}
                    <div className="sm:hidden mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                      <button
                        onClick={() => onOpenTutorForAssignment(assignment)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI Tutor</span>
                      </button>
                      <button
                        onClick={() => onStartTimerForAssignment(assignment)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-md"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Focus</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
