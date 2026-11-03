import React from 'react';
import { Assignment } from '../types';
import { Sparkles, Play, CheckCircle2, Clock, Calendar, ArrowRight, Flame } from 'lucide-react';

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

  const nextUrgentAssignment = pendingAssignments
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const completionRate =
    assignments.length > 0
      ? Math.round((completedAssignments.length / assignments.length) * 100)
      : 0;

  const totalMinutesRemaining = pendingAssignments.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  return (
    <div className="mb-8 space-y-6">
      {/* Editorial Header & Date Horizon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
            <span>Fall Semester 2026</span>
            <span aria-hidden="true">·</span>
            <span>Week 10 of 15</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Today's Study Horizon
          </h1>
        </div>

        {/* Quiet Meta Stats in clean unboxed typography */}
        <div className="flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>
              <strong className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100 font-semibold">12-Day</strong> Study Streak
            </span>
          </div>
          <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
          <div>
            <span>Target: </span>
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100 font-semibold">4 Pomodoros/Day</span>
          </div>
        </div>
      </div>

      {/* 4-Stat Metric Row (Zero-Pill tabular numbers, single-elevation surfaces) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Pending Tasks
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50">
              {pendingAssignments.length}
            </span>
            {urgentCount > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-medium">
                ({urgentCount} urgent)
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Est. Workload
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50">
              {(totalMinutesRemaining / 60).toFixed(1)}
            </span>
            <span className="text-xs text-neutral-500 font-mono">hours left</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Focus Logged Today
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {todayStudyMinutes}
            </span>
            <span className="text-xs text-neutral-500 font-mono">minutes</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Completion Rate
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-50">
              {completionRate}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {completedAssignments.length} done
            </span>
          </div>
        </div>
      </div>

      {/* Main Focus Anchor Card with Library Backdrop & Scrim */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-950 text-white min-h-[220px] flex flex-col justify-between p-6 sm:p-8 shadow-sm">
        {/* Photo scrim */}
        <img
          src="/src/assets/images/library_study_atmosphere_1793694012661.jpg"
          alt="Modern collegiate study library"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/60" />

        <div className="relative z-10 max-w-2xl">
          {nextUrgentAssignment ? (
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-300 mb-2 font-mono uppercase tracking-widest">
                <span className="text-indigo-400 font-semibold">{nextUrgentAssignment.subject}</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-rose-400">Due Soon</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2.5">
                {nextUrgentAssignment.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 mb-5 leading-relaxed font-sans max-w-xl">
                {nextUrgentAssignment.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenTutorForAssignment(nextUrgentAssignment)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white text-neutral-950 hover:bg-neutral-100 shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Get Socratic Breakdown</span>
                </button>

                <button
                  onClick={() => onStartTimerForAssignment(nextUrgentAssignment)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 transition-all whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 25m Focus Block</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>All caught up on assignments</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
                Clear horizon! Ready for preview revision?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mb-5 max-w-md">
                Spend 15 minutes reviewing flashcard decks or explore key calculus and physics formulas.
              </p>
              <button
                onClick={onOpenNewAssignment}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <span>Log Next Homework Task</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom meta row */}
        <div className="relative z-10 pt-4 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>Next Exam: <strong className="text-white font-mono">AP Physics Mechanics (Nov 12)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Office Hours: <strong className="text-white">Today 3:30 PM (Dr. Vance)</strong></span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            Powered by Socratic Homework Engine
          </div>
        </div>
      </div>
    </div>
  );
};
