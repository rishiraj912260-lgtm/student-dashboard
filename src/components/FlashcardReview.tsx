import React, { useState } from 'react';
import { Flashcard } from '../types';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  subjects: string[];
  onUpdateCardMastery: (cardId: string, mastery: 'new' | 'learning' | 'mastered') => void;
  onAddCard: (card: Omit<Flashcard, 'id'>) => void;
  onOpenTutorWithPrompt: (prompt: string, subject: string) => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  flashcards,
  subjects,
  onUpdateCardMastery,
  onAddCard,
  onOpenTutorWithPrompt,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form states for new card
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0] || 'General');

  const filteredCards = flashcards.filter(
    (card) => selectedSubject === 'all' || card.subject === selectedSubject
  );

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(Math.floor(Math.random() * filteredCards.length));
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    onAddCard({
      subject: newSubject,
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      mastery: 'new',
    });

    setNewFront('');
    setNewBack('');
    setNewHint('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls: Deck Selector & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Deck:</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
              setShowHint(false);
            }}
            className="px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Flashcard Decks ({flashcards.length})</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 bg-neutral-100 dark:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Randomize card order"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard 3D Card Area */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-white/50 dark:bg-neutral-900/50">
          <HelpCircle className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">No flashcards in this deck</h3>
          <p className="text-xs text-neutral-500 mt-1">Create your first card to start reviewing.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
          >
            Create Flashcard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Container with Perspective Flip */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] sm:min-h-[320px] w-full p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm cursor-pointer select-none transition-all flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 relative group"
          >
            {/* Top metadata row (Zero-Pill clean typography) */}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {currentCard.subject}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span>
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    currentCard.mastery === 'mastered'
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : currentCard.mastery === 'learning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-neutral-400'
                  }
                >
                  {currentCard.mastery.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Center Content */}
            <div className="py-6 text-center max-w-xl mx-auto">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                {isFlipped ? 'Answer & Explanation' : 'Question / Prompt'}
              </div>
              <p className="text-base sm:text-xl font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>

              {/* Optional Hint */}
              {!isFlipped && currentCard.hint && showHint && (
                <div className="mt-4 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 text-left">
                  <span className="font-semibold">Hint: </span>
                  {currentCard.hint}
                </div>
              )}
            </div>

            {/* Bottom click instruction & hint button */}
            <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <div>
                {!isFlipped && currentCard.hint && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                )}
              </div>
              <div className="text-[11px] font-mono">
                Click card to {isFlipped ? 'flip back' : 'reveal answer'} ↻
              </div>
            </div>
          </div>

          {/* Bottom Card Controls: Mastery Rating & Next/Prev */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Previous card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                title="Next card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mastery self-evaluation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onUpdateCardMastery(currentCard.id, 'learning');
                  handleNext();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Needs Review</span>
              </button>

              <button
                onClick={() => {
                  onUpdateCardMastery(currentCard.id, 'mastered');
                  handleNext();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Got It! (Mastered)</span>
              </button>

              {/* Ask Tutor about this card */}
              <button
                onClick={() =>
                  onOpenTutorWithPrompt(
                    `Explain this concept in depth: ${currentCard.front} (Answer: ${currentCard.back})`,
                    currentCard.subject
                  )
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Deep dive with AI tutor"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ask Tutor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Add New Flashcard
            </h3>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Front (Question or Prompt)
                </label>
                <textarea
                  rows={3}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the derivative of arcsin(x)?"
                  required
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Back (Answer & Key Formula)
                </label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. 1 / sqrt(1 - x^2)"
                  required
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Optional Hint
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="e.g. Recall the relationship between sin² and cos²"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
