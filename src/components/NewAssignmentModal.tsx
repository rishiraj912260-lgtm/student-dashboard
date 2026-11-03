import React, { useState } from 'react';
import { Assignment, Priority } from '../types';
import { X, Plus, Trash2, CalendarDays, Clock, Layers } from 'lucide-react';

interface NewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: string[];
  onAddAssignment: (assignment: Assignment) => void;
}

export const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddAssignment,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0] || 'General');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState('23:59');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>('high');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [tags, setTags] = useState('Homework, Review');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleUpdateSubtask = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const checklist = subtasks
      .filter((s) => s.trim().length > 0)
      .map((text, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        text: text.trim(),
        done: false,
      }));

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: title.trim(),
      subject,
      dueDate,
      dueTime,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      priority,
      status: 'not-started',
      description: description.trim(),
      checklist,
      tags: parsedTags,
    };

    onAddAssignment(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-neutral-800/80 mb-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Log Homework Assignment
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Add problem set details, deadlines, and action steps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Problem Set 8: Integration by Parts"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Subject Course *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="urgent">Urgent (Due in 24-48h)</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Est. Duration (min)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Problem Description / Prompt
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste specific problem numbers, page numbers, or guidelines..."
              className="w-full px-4 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-2xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Action Steps / Subtasks
              </label>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={st}
                    onChange={(e) => handleUpdateSubtask(i, e.target.value)}
                    placeholder={`Step ${i + 1}: e.g. Solve parts (a) and (b)`}
                    className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100"
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="p-2 text-neutral-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Calculus, ProblemSet, ExamReview"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white dark:text-neutral-950 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
