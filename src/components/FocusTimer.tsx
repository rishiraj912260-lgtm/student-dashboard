import React, { useState, useEffect, useRef } from 'react';
import { Assignment } from '../types';
import { playTimerCompletionChime, setAmbientSound } from '../utils/audio';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Sparkles, BookOpen, BellRing } from 'lucide-react';

interface FocusTimerProps {
  assignments: Assignment[];
  activeAssignment?: Assignment | null;
  onSessionComplete: (minutes: number, assignmentTitle: string, subject: string) => void;
  onOpenTutorForAssignment: (assignment: Assignment) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  assignments,
  activeAssignment: initialAssignment,
  onSessionComplete,
  onOpenTutorForAssignment,
}) => {
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    initialAssignment?.id || (assignments.length > 0 ? assignments[0].id : '')
  );
  const [ambientMode, setAmbientMode] = useState<'none' | 'rain' | 'whitenoise'>('none');
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(3);

  const totalTimeRef = useRef<number>(25 * 60);

  useEffect(() => {
    let mins = 25;
    if (sessionType === 'focus') mins = customMinutes;
    else if (sessionType === 'shortBreak') mins = 5;
    else if (sessionType === 'longBreak') mins = 15;

    totalTimeRef.current = mins * 60;
    setTimeLeft(mins * 60);
    setIsRunning(false);
  }, [sessionType, customMinutes]);

  useEffect(() => {
    if (initialAssignment) {
      setSelectedAssignmentId(initialAssignment.id);
    }
  }, [initialAssignment]);

  useEffect(() => {
    if (isRunning && ambientMode !== 'none') {
      setAmbientSound(ambientMode, 0.04);
    } else {
      setAmbientSound('none');
    }

    return () => {
      setAmbientSound('none');
    };
  }, [isRunning, ambientMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playTimerCompletionChime();

      if (sessionType === 'focus') {
        const assigned = assignments.find((a) => a.id === selectedAssignmentId);
        onSessionComplete(
          customMinutes,
          assigned?.title || 'Independent Study',
          assigned?.subject || 'General'
        );
        setSessionsCompletedToday((prev) => prev + 1);
        setSessionType('shortBreak');
      } else {
        setSessionType('focus');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, sessionType, customMinutes, assignments, selectedAssignmentId, onSessionComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTimeRef.current);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressRatio = totalTimeRef.current > 0 ? (totalTimeRef.current - timeLeft) / totalTimeRef.current : 0;
  const strokeDashoffset = 2 * Math.PI * 115 * (1 - progressRatio);

  const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Session type selector segmented buttons */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs">
          <button
            onClick={() => setSessionType('focus')}
            className={`px-4 py-2 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              sessionType === 'focus'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => setSessionType('shortBreak')}
            className={`px-4 py-2 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              sessionType === 'shortBreak'
                ? 'bg-white dark:bg-neutral-700 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setSessionType('longBreak')}
            className={`px-4 py-2 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              sessionType === 'longBreak'
                ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Recovery (15m)
          </button>
        </div>
      </div>

      {/* Main Focus Clock Interface */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Progress SVG Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r="115"
              className="text-neutral-100 dark:text-neutral-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="160"
              cy="160"
              r="115"
              className="text-neutral-900 dark:text-white transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 115}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time Centerpiece */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono tabular-nums text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono font-medium text-neutral-400 uppercase tracking-widest mt-2">
              {sessionType === 'focus' ? 'Deep Work' : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Primary Timer Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTimer}
            className="px-8 py-3.5 text-xs sm:text-sm font-bold text-white dark:text-neutral-950 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => setTimeLeft(0)}
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
            title="Fast forward to completion chime"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>

        {/* Attached Homework Assignment Selector */}
        <div className="w-full max-w-md mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 text-center block">
            Target Assignment
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- General Independent Study --</option>
            {assignments.map((asg) => (
              <option key={asg.id} value={asg.id}>
                {asg.subject}: {asg.title}
              </option>
            ))}
          </select>

          {currentAssignment && (
            <div className="mt-2 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl flex items-center justify-between text-xs border border-neutral-200/50 dark:border-neutral-700/50">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{currentAssignment.title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">{currentAssignment.subject} · {currentAssignment.estimatedMinutes}m est.</p>
              </div>
              <button
                onClick={() => onOpenTutorForAssignment(currentAssignment)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 rounded-lg shrink-0 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ask AI</span>
              </button>
            </div>
          )}
        </div>

        {/* Ambient Noise Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">Ambient Background:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAmbientMode('none')}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  ambientMode === 'none'
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Mute
              </button>
              <button
                onClick={() => setAmbientMode('rain')}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  ambientMode === 'rain'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Gentle Rain
              </button>
              <button
                onClick={() => setAmbientMode('whitenoise')}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  ambientMode === 'whitenoise'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                White Noise
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>
              <strong>{sessionsCompletedToday}</strong> Pomodoros logged today
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
