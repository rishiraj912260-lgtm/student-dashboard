import React from 'react';
import { Assignment } from '../types';
import { Sparkles, Play, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';

interface DashboardOverviewProps {
  assignments: Assignment[];
  onOpenTutorForAssignment: (assignment: Assignment) => void;
  onStartTimerForAssignment: (assignment: Assignment) => void;
  onOpenNewAssignment: () => void;
  todayStudyMinutes: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  assignments,
  onOpenTutorForAssignment,
  onStartTimerForAssignment,
  onOpenNewAssignment,
  todayStudyMinutes,
}) => {
  const pendingAssignments = assignments.filter((a) => a.status !== 'completed');
  const completedAssignments = assignments.filter((a) => a.status === 'completed');
  const urgentCount = pendingAssignments.filter((a) => a.priority === 'urgent' || a.priority === 'high').length;

  // Next urgent assignment
  const nextUrgentAssignment = pendingAssignments
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const completionRate =
    assignments.length > 0
      ? Math.round((completedAssignments.length / assignments.length) * 100)
      : 0;

  return (
    <div className="mb-8">
      {/* Editorial Welcome & Quick Status (Zero-Pill Discipline: unboxed metadata with separators) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Student Homework Workspace
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>Fall Semester 2026</span>
            <span aria-hidden="true">·</span>
            <span>5 Enrolled Subjects</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-medium">
              {todayStudyMinutes}m focused study logged today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <div>
            <span>Completion Rate: </span>
            <span className="font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{completionRate}%</span>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span>Urgent: </span>
            <span className="font-bold tabular-nums text-rose-600 dark:text-rose-400">{urgentCount}</span>
          </div>
        </div>
      </div>

      {/* Main Focus Feature Banner with Library Backdrop & Single-elevation depth */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white min-h-[200px] flex flex-col justify-between p-6 shadow-sm">
        {/* Measured scrim background image */}
        <img
          src="/src/assets/images/library_study_atmosphere_1793694012661.jpg"
          alt="Study library atmosphere"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-900/60" />

        <div className="relative z-10 max-w-2xl">
          {nextUrgentAssignment ? (
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-300 mb-1 font-mono uppercase tracking-wider">
                <span>Next Deadline Priority</span>
                <span aria-hidden="true">·</span>
                <span>{nextUrgentAssignment.subject}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                {nextUrgentAssignment.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 mb-4 leading-relaxed">
                {nextUrgentAssignment.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenTutorForAssignment(nextUrgentAssignment)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Step-by-Step AI Help</span>
                </button>

                <button
                  onClick={() => onStartTimerForAssignment(nextUrgentAssignment)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 25m Focus Session</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All assignments up to date!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                Great job staying ahead of your homework schedule.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mb-4">
                Review flashcards, explore formulas, or ask the AI tutor to practice advanced topics.
              </p>
              <button
                onClick={onOpenNewAssignment}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                <span>Add Your Next Assignment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom metric ticker (factual, real metrics, tabular numbers) */}
        <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="font-mono tabular-nums text-white">{pendingAssignments.length}</strong> active tasks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>
                <strong className="font-mono tabular-nums text-white">
                  {pendingAssignments.reduce((acc, curr) => acc + curr.estimatedMinutes, 0)}
                </strong> min estimated work left
              </span>
            </div>
          </div>

          <div className="text-neutral-400 text-[11px]">
            Target: 4 focus cycles per evening
          </div>
        </div>
      </div>
    </div>
  );
};
