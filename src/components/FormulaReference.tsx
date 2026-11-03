import React, { useState } from 'react';
import { FormulaSnippet } from '../types';
import { Search, Copy, CheckCircle, Sparkles, BookOpen } from 'lucide-react';

interface FormulaReferenceProps {
  formulas: FormulaSnippet[];
  onOpenTutorWithFormula: (formula: FormulaSnippet) => void;
}

export const FormulaReference: React.FC<FormulaReferenceProps> = ({
  formulas,
  onOpenTutorWithFormula,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Writing'];

  const filteredFormulas = formulas.filter((f) => {
    if (selectedSubject !== 'All' && f.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      const matchLatex = f.latex.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLatex) return false;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Subject Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-xs overflow-x-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedSubject === sub
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search formulas or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of formula cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              {/* Card Header (Zero-Pill Discipline: unboxed metadata) */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] uppercase tracking-wider">
                  {item.subject}
                </span>
                <button
                  onClick={() => handleCopy(item.latex, item.id)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  title="Copy LaTeX formula"
                >
                  {copiedId === item.id ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy LaTeX</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {item.description}
              </p>

              {/* Formula Display Box */}
              <div className="my-3.5 p-3.5 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 font-mono text-xs sm:text-sm text-center text-neutral-900 dark:text-neutral-100 overflow-x-auto shadow-2xs">
                <code>{item.latex}</code>
              </div>

              {/* Variables breakdown list */}
              {item.variables.length > 0 && (
                <div className="space-y-1.5 my-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                    Variable Breakdown:
                  </span>
                  <div className="space-y-1">
                    {item.variables.map((v, i) => (
                      <div key={i} className="text-xs flex items-baseline gap-2 text-neutral-600 dark:text-neutral-400">
                        <strong className="font-mono text-neutral-900 dark:text-neutral-200 text-[11px] shrink-0">
                          {v.name}:
                        </strong>
                        <span className="leading-tight">{v.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.example && (
                <div className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-50/70 dark:bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Application: </span>
                  {item.example}
                </div>
              )}
            </div>

            {/* Bottom action: Ask tutor */}
            <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => onOpenTutorWithFormula(item)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-xl transition-colors whitespace-nowrap shrink-0 border border-indigo-200/50 dark:border-indigo-800/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Apply with Socratic Tutor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
