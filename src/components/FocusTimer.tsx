import React, { useState, useEffect, useRef } from 'react';
import { Assignment } from '../types';
import { playTimerCompletionChime, setAmbientSound } from '../utils/audio';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles, BookOpen } from 'lucide-react';

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

  // Update time when session type changes
  useEffect(() => {
    let mins = 25;
    if (sessionType === 'focus') mins = customMinutes;
    else if (sessionType === 'shortBreak') mins = 5;
    else if (sessionType === 'longBreak') mins = 15;

    totalTimeRef.current = mins * 60;
    setTimeLeft(mins * 60);
    setIsRunning(false);
  }, [sessionType, customMinutes]);

  // Sync initial assignment if given
  useEffect(() => {
    if (initialAssignment) {
      setSelectedAssignmentId(initialAssignment.id);
    }
  }, [initialAssignment]);

  // Handle ambient sound state
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

  // Timer countdown effect
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

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTimeRef.current);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressRatio = totalTimeRef.current > 0 ? (totalTimeRef.current - timeLeft) / totalTimeRef.current : 0;
  const strokeDashoffset = 2 * Math.PI * 110 * (1 - progressRatio);

  const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session type selector segmented buttons */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => setSessionType('focus')}
            className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              sessionType === 'focus'
                ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => setSessionType('shortBreak')}
            className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              sessionType === 'shortBreak'
                ? 'bg-white dark:bg-neutral-700 text-teal-600 dark:text-teal-400 font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setSessionType('longBreak')}
            className={`px-4 py-2 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              sessionType === 'longBreak'
                ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Rest Cycle (15m)
          </button>
        </div>
      </div>

      {/* Main Focus Clock Interface */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Progress SVG Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="128"
              cy="128"
              r="110"
              className="text-neutral-100 dark:text-neutral-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="128"
              cy="128"
              r="110"
              className="text-indigo-600 dark:text-indigo-500 transition-all duration-300"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time Centerpiece */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono tabular-nums text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">
              {sessionType === 'focus' ? 'Deep Work' : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Primary Timer Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setTimeLeft(0);
            }}
            className="p-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
            title="Fast forward / Complete"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Attached Homework Assignment Selector */}
        <div className="w-full max-w-md mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">
            Attaching Session To Assignment
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">-- Independent Study Session --</option>
            {assignments.map((asg) => (
              <option key={asg.id} value={asg.id}>
                {asg.subject}: {asg.title}
              </option>
            ))}
          </select>

          {currentAssignment && (
            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{currentAssignment.title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{currentAssignment.subject} · {currentAssignment.estimatedMinutes}m est.</p>
              </div>
              <button
                onClick={() => onOpenTutorForAssignment(currentAssignment)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 rounded-md shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          )}
        </div>

        {/* Ambient Sound Settings & Daily Sessions Counter */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">Ambient Audio:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAmbientMode('none')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  ambientMode === 'none'
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Mute
              </button>
              <button
                onClick={() => setAmbientMode('rain')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  ambientMode === 'rain'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Gentle Rain
              </button>
              <button
                onClick={() => setAmbientMode('whitenoise')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  ambientMode === 'whitenoise'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
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
