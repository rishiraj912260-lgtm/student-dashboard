import React, { useState, useRef, useEffect } from 'react';
import { TutorMode, ChatMessage, Assignment } from '../types';
import {
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  CheckCircle,
  Copy,
  RotateCcw,
  Lightbulb,
  FileText,
  HelpCircle as QuizIcon,
  Loader2,
} from 'lucide-react';

interface AITutorPanelProps {
  subjects: string[];
  assignments: Assignment[];
  activeAssignment?: Assignment | null;
  onClearActiveAssignment?: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  subjects,
  assignments,
  activeAssignment,
  onClearActiveAssignment,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    activeAssignment?.subject || subjects[0] || 'General'
  );
  const [tutorMode, setTutorMode] = useState<TutorMode>('step-by-step');
  const [queryInput, setQueryInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message from tutor
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'tutor',
      content: `### 👋 Welcome to ScholarFlow Homework Tutor!

I'm your dedicated homework assistant. Whether you're stuck on a calculus derivative, tackling an organic chemistry mechanism, balancing physics vectors, or refining an essay thesis, I'm here to help you understand the concepts thoroughly.

**Choose your learning mode above:**
- **Step-by-Step Breakdown**: Clear sequential derivation with equations and verification.
- **Socratic Guidance**: I won't give away the solution—I'll guide your thinking with hints!
- **Concept Explainer**: Everyday analogies and intuitive breakdowns.
- **Essay & Writing Coach**: Thesis refinement, argumentation structure, and citations.
- **Quick Practice Quiz**: 3 questions to verify you've mastered the concept.

Select a preset question below or paste your homework problem to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'step-by-step',
      subject: 'AP Calculus BC',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // When activeAssignment prop changes, auto-fill subject and context prompt if provided
  useEffect(() => {
    if (activeAssignment) {
      setSelectedSubject(activeAssignment.subject);
      setQueryInput(
        `Please help me with my assignment "${activeAssignment.title}": ${activeAssignment.description.slice(0, 150)}...`
      );
    }
  }, [activeAssignment]);

  const promptSuggestions: { label: string; mode: TutorMode; subject: string; text: string }[] = [
    {
      label: 'Taylor Series Remainder',
      mode: 'step-by-step',
      subject: 'AP Calculus BC',
      text: 'How do I calculate the Lagrange error bound for the 4th degree Taylor polynomial of cos(x) on [-pi/4, pi/4]?',
    },
    {
      label: 'Socratic Physics Clue',
      mode: 'socratic',
      subject: 'AP Physics C: Mechanics',
      text: 'I need to derive escape velocity from a planet of mass M and radius R using mechanical energy conservation. Where do I start?',
    },
    {
      label: 'Aspirin Synthesis TLC',
      mode: 'explain',
      subject: 'Organic Chemistry II',
      text: 'Why does salicylic acid move faster or slower than acetylsalicylic acid on a silica TLC plate with ethyl acetate solvent?',
    },
    {
      label: 'Essay Thesis Polish',
      mode: 'essay-coach',
      subject: 'World Literature & Rhetoric',
      text: 'Here is my draft thesis: "Hamlet and Raskolnikov both delay action because they are troubled." How can I make this an argumentative, college-level thesis?',
    },
    {
      label: 'Red-Black Tree Quiz',
      mode: 'quiz',
      subject: 'Data Structures & Algorithms',
      text: 'Generate a 3-question diagnostic quiz on Red-Black Tree rotation invariants and the black-height rule.',
    },
  ];

  const handleSendMessage = async (customQuery?: string) => {
    const textToSend = customQuery || queryInput;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: tutorMode,
      subject: selectedSubject,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          subject: selectedSubject,
          mode: tutorMode,
          assignmentContext: activeAssignment?.title || '',
          chatHistory: messages.map((m) => ({ role: m.role, text: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: data.answer || 'I could not generate an explanation at this moment. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: tutorMode,
        subject: selectedSubject,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('Homework tutor error:', err);
      const fallbackMsg: ChatMessage = {
        id: `tutor-err-${Date.now()}`,
        role: 'tutor',
        content: `### 💡 Guiding Strategy for: "${textToSend}"

1. **Fundamental Principle**: In **${selectedSubject}**, start by identifying all given parameters and state variables.
2. **Breakdown**:
   - Write out the governing formula relating your target unknown to the known inputs.
   - For mathematical equations, isolate the variable algebraically before plugging in numbers.
   - For conceptual questions, evaluate the initial conditions vs boundary limits.
3. **Verification**: Double-check units and test with boundary cases (e.g. x = 0 or limits at infinity).

*Feel free to ask a follow-up question or specify which step feels unclear!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: tutorMode,
        subject: selectedSubject,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown with clean typography
  const renderFormattedContent = (content: string) => {
    // Split into paragraphs / headers / code
    const lines = content.split('\n');
    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 pt-2 border-b border-neutral-100 dark:border-neutral-800 pb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={idx} className="font-semibold text-xs sm:text-sm text-indigo-700 dark:text-indigo-400 pt-1">
                {trimmed.replace('#### ', '')}
              </h5>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 py-1 my-1.5 border-l-2 border-indigo-500 text-neutral-600 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-800/40 rounded-r">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          if (trimmed.startsWith('---')) {
            return <hr key={idx} className="border-neutral-200 dark:border-neutral-800 my-2" />;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc pl-1">
                {trimmed.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="ml-1 pl-1">
                {trimmed}
              </div>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Sidebar: Controls, Learning Modes & Quick Prompts */}
      <div className="w-full lg:w-80 shrink-0 space-y-5">
        {/* Mode Selector Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Tutor Learning Mode
            </h3>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Pedagogy First</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => setTutorMode('step-by-step')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                tutorMode === 'step-by-step'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-indigo-500" />
              <div>
                <p className="leading-tight">Step-by-Step Breakdown</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                  Detailed sequential mathematical chain
                </p>
              </div>
            </button>

            <button
              onClick={() => setTutorMode('socratic')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                tutorMode === 'socratic'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
              <div>
                <p className="leading-tight">Socratic Guidance (Hints)</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                  Guiding questions without spoiling answers
                </p>
              </div>
            </button>

            <button
              onClick={() => setTutorMode('explain')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                tutorMode === 'explain'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-teal-500" />
              <div>
                <p className="leading-tight">Concept Explainer</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                  Analogies and intuitive real-world models
                </p>
              </div>
            </button>

            <button
              onClick={() => setTutorMode('essay-coach')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                tutorMode === 'essay-coach'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-rose-500" />
              <div>
                <p className="leading-tight">Essay & Writing Coach</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                  Thesis polish, argument logic & citations
                </p>
              </div>
            </button>

            <button
              onClick={() => setTutorMode('quiz')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                tutorMode === 'quiz'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <QuizIcon className="w-4 h-4 shrink-0 text-sky-500" />
              <div>
                <p className="leading-tight">Knowledge Check Quiz</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">
                  3 diagnostic questions before turning in work
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Subject & Context Selector */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Subject Focus
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {activeAssignment && (
            <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-800 dark:text-indigo-300">Linked Assignment</span>
                {onClearActiveAssignment && (
                  <button
                    onClick={onClearActiveAssignment}
                    className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Unlink
                  </button>
                )}
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 font-medium mt-1 truncate">
                {activeAssignment.title}
              </p>
            </div>
          )}
        </div>

        {/* Quick Question Starters */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
            Quick Starters
          </h4>
          <div className="space-y-1.5">
            {promptSuggestions.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedSubject(item.subject);
                  setTutorMode(item.mode);
                  handleSendMessage(item.text);
                }}
                className="w-full text-left p-2 rounded-lg text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
              >
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{item.label}</div>
                <div className="text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{item.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Stream & Interactive Input */}
      <div className="flex-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-col h-[700px] overflow-hidden">
        {/* Tutor Window Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>ScholarFlow Socratic Assistant</span>
              </h3>
              <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                <span>Subject: {selectedSubject}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">Mode: {tutorMode.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'reset',
                  role: 'tutor',
                  content: 'Session refreshed. Ready for your next homework problem or question!',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  mode: tutorMode,
                  subject: selectedSubject,
                },
              ]);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            title="Reset discussion thread"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Thread</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-4 shadow-xs relative group ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/70 rounded-bl-none text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {/* Copy button on tutor responses */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="absolute top-3 right-3 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 bg-white/80 dark:bg-neutral-700/80 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {isUser ? (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    renderFormattedContent(message.content)
                  )}

                  <div
                    className={`mt-2 text-[10px] font-mono ${
                      isUser ? 'text-indigo-200 text-right' : 'text-neutral-400 text-left'
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-neutral-500 dark:text-neutral-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/70 rounded-xl">
                <span>ScholarFlow tutor is formulating your step-by-step breakdown...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={`Ask a question or paste a problem from ${selectedSubject}...`}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!queryInput.trim() || loading}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </button>
          </form>

          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Powered by Gemini 3.8 Flash homework reasoning</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
