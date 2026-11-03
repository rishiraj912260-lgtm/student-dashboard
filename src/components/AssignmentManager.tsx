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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  CalendarDays,
  Filter,
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
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<{ [key: string]: string }>({});

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        if (filterTab === 'urgent' && a.priority !== 'urgent' && a.priority !== 'high') return false;
        if (filterTab === 'in-progress' && a.status !== 'in-progress') return false;
        if (filterTab === 'completed' && a.status !== 'completed') return false;

        if (selectedSubject !== 'all' && a.subject !== selectedSubject) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchSubject = a.subject.toLowerCase().includes(q);
          const matchDesc = a.description.toLowerCase().includes(q);
          const matchTags = a.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchSubject && !matchDesc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
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
        return 'text-neutral-600 dark:text-neutral-400 font-medium';
      case 'low':
        return 'text-neutral-400 dark:text-neutral-500 font-normal';
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
    let isUrgent = false;

    if (diffDays === 0) {
      dayText = 'Due Today';
      isUrgent = true;
    } else if (diffDays === 1) {
      dayText = 'Due Tomorrow';
      isUrgent = true;
    } else if (diffDays < 0) {
      dayText = `${Math.abs(diffDays)}d Overdue`;
      isUrgent = true;
    } else {
      dayText = `Due in ${diffDays}d`;
    }

    const formattedDate = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label: `${dayText} · ${formattedDate}${timeStr ? ` at ${timeStr}` : ''}`,
      isUrgent,
    };
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Segmented Filters, Subject Filter, Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Functional Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              filterTab === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            All Tasks ({assignments.length})
          </button>
          <button
            onClick={() => setFilterTab('urgent')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              filterTab === 'urgent'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Urgent Deadlines
          </button>
          <button
            onClick={() => setFilterTab('in-progress')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              filterTab === 'in-progress'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              filterTab === 'completed'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search homework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/30">
          <AlertCircle className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No assignments match your view
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedSubject !== 'all' || filterTab !== 'all'
              ? 'Clear search or subject filters to reveal all homework items.'
              : 'You have no homework logged for this semester. Click below to add one.'}
          </p>
          <button
            onClick={() => {
              setFilterTab('all');
              setSelectedSubject('all');
              setSearchQuery('');
              onOpenNewAssignment();
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 transition-colors shadow-xs"
          >
            Create New Task
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

            const dueInfo = formatDueDate(assignment.dueDate, assignment.dueTime);

            return (
              <div
                key={assignment.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  assignment.status === 'completed'
                    ? 'border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 opacity-75'
                    : 'border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  {/* Left: Complete Checkbox + Body */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleStatus(assignment.id)}
                      className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={assignment.status === 'completed' ? 'Mark in progress' : 'Mark completed'}
                    >
                      {assignment.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 stroke-[1.75]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Zero-Pill Unboxed Metadata Line */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {assignment.subject}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className={getPriorityStyle(assignment.priority)}>
                          {assignment.priority.toUpperCase()}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span
                          className={`font-mono ${
                            dueInfo.isUrgent && assignment.status !== 'completed'
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {dueInfo.label}
                        </span>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-mono tabular-nums text-neutral-500">
                          {assignment.estimatedMinutes}m est.
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 ${
                          assignment.status === 'completed'
                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                            : ''
                        }`}
                      >
                        {assignment.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>

                      {/* Progress summary bar */}
                      {assignment.checklist.length > 0 && (
                        <div className="mt-3.5 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 font-medium">
                            {completedSubtasks}/{assignment.checklist.length} ({progress}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenTutorForAssignment(assignment)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xs"
                      title="Ask AI tutor to solve or explain this assignment"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                      <span>Solve with AI</span>
                    </button>

                    <button
                      onClick={() => onStartTimerForAssignment(assignment)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      title="Start focus timer on this assignment"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Focus</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
                      aria-label="Toggle subtasks"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtask Checklist & Breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 rounded-b-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <span>Step-by-Step Task Breakdown</span>
                      <span className="text-[11px] font-normal text-neutral-500">
                        Check off each problem or section as you complete it
                      </span>
                    </div>

                    {assignment.checklist.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-1">
                        No subtasks added yet. Add subtasks to break down this problem.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignment.checklist.map((sub) => (
                          <label
                            key={sub.id}
                            className="flex items-start gap-3 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none group p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-800/50 transition-colors"
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

                    {/* Mobile Button Actions */}
                    <div className="sm:hidden pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                      <button
                        onClick={() => onOpenTutorForAssignment(assignment)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 rounded-xl"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Solve with AI</span>
                      </button>
                      <button
                        onClick={() => onStartTimerForAssignment(assignment)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
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
