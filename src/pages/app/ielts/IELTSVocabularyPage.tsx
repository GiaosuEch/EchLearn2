import { useMemo, useState } from 'react';
import { BookOpenCheck, Brain, ChevronRight, Lightbulb, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../../PageShell';
import {
  buildIeltsVocabularyReviewQueue,
  type IeltsVocabularyBand,
  type IeltsVocabularyProgress,
  type IeltsVocabularyRating,
  type IeltsVocabularyTopic,
  filterIeltsVocabulary,
  gradeIeltsVocabularyReview,
} from '../../../curriculum/ieltsVocabulary';

const STORAGE_KEY = 'echlern_ielts_vocabulary_progress_v1';
const bands: readonly (IeltsVocabularyBand | 'all')[] = ['all', '6.5', '7.5', '8.0+'];
const topics: readonly (IeltsVocabularyTopic | 'all')[] = ['all', 'Environment', 'Technology', 'Education', 'Health', 'Society', 'Work'];

function readProgress(): IeltsVocabularyProgress[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data)
      ? data.filter((item): item is IeltsVocabularyProgress => (
        typeof item === 'object' && item !== null
        && typeof (item as IeltsVocabularyProgress).entryId === 'string'
        && typeof (item as IeltsVocabularyProgress).dueAt === 'string'
      ))
      : [];
  } catch {
    return [];
  }
}

function saveProgress(progress: readonly IeltsVocabularyProgress[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function IELTSVocabularyPage() {
  const now = useMemo(() => new Date().toISOString(), []);
  const [progress, setProgress] = useState<IeltsVocabularyProgress[]>(readProgress);
  const [band, setBand] = useState<IeltsVocabularyBand | 'all'>('all');
  const [topic, setTopic] = useState<IeltsVocabularyTopic | 'all'>('all');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const reviewQueue = useMemo(() => buildIeltsVocabularyReviewQueue(progress, now, 12), [progress, now]);
  const filtered = useMemo(() => filterIeltsVocabulary({ band, topic, query }), [band, topic, query]);
  const active = reviewQueue[activeIndex % Math.max(reviewQueue.length, 1)] ?? null;
  const mastered = progress.filter((item) => item.repetitions >= 3 && item.dueAt > now).length;

  const rate = (rating: IeltsVocabularyRating) => {
    if (!active) return;
    const updated = gradeIeltsVocabularyReview(active.progress, rating, new Date().toISOString());
    const next = [
      ...progress.filter((item) => item.entryId !== updated.entryId),
      updated,
    ];
    setProgress(next);
    saveProgress(next);
    setRevealed(false);
    setActiveIndex((value) => value + 1);
  };

  return (
    <PageShell
      title="IELTS Vocabulary"
      description="Offline band-targeted vocabulary with deterministic spaced repetition."
      icon={<BookOpenCheck size={20} />}
      backTo="/app/ielts"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-3 sm:grid-cols-3" aria-label="IELTS vocabulary progress">
          <div className="glass-card p-4">
            <p className="text-xs font-semibold uppercase text-dark-400">Due now</p>
            <p className="mt-1 text-2xl font-bold text-white">{reviewQueue.length}</p>
            <p className="mt-1 text-sm text-dark-400">Words ready for retrieval practice</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-semibold uppercase text-dark-400">Learning</p>
            <p className="mt-1 text-2xl font-bold text-primary-400">{progress.length}</p>
            <p className="mt-1 text-sm text-dark-400">Saved only on this device</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-semibold uppercase text-dark-400">Stable recall</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{mastered}</p>
            <p className="mt-1 text-sm text-dark-400">Three or more successful reviews</p>
          </div>
        </section>

        {active ? (
          <section className="glass-card overflow-hidden" aria-labelledby="review-heading">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-700/70 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">Spaced repetition review</p>
                <h2 id="review-heading" className="mt-1 text-lg font-semibold text-white">Recall, then reveal</h2>
              </div>
              <span className="rounded-md bg-dark-800 px-3 py-1 text-sm text-dark-300">{activeIndex % reviewQueue.length + 1} of {reviewQueue.length}</span>
            </div>
            <div className="grid lg:grid-cols-[1.15fr_.85fr]">
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                className="min-h-[330px] border-b border-dark-700/70 p-7 text-left transition-colors hover:bg-dark-900/40 lg:border-b-0 lg:border-r focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-inset"
                aria-expanded={revealed}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md bg-primary-500/15 px-2.5 py-1 text-xs font-bold text-primary-300">Band {active.entry.band}</span>
                  <span className="text-xs text-dark-400">{active.entry.topic} · {active.entry.partOfSpeech}</span>
                </div>
                <p className="mt-10 text-3xl font-bold text-white sm:text-4xl">{active.entry.term}</p>
                {revealed ? (
                  <div className="mt-7 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-primary-300">Meaning</p>
                      <p className="mt-1 text-lg text-white">{active.entry.definition}</p>
                      <p className="mt-1 text-sm text-dark-300">Vietnamese: {active.entry.vietnameseMeaning}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-300">In context</p>
                      <p className="mt-1 text-dark-200">“{active.entry.example}”</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-8 text-sm text-dark-400">Say the definition and one natural collocation aloud, then reveal the answer.</p>
                )}
              </button>
              <aside className="space-y-5 p-6">
                <div>
                  <p className="text-sm font-semibold text-white">Collocations</p>
                  <ul className="mt-3 space-y-2" role="list">
                    {active.entry.collocations.map((collocation) => <li key={collocation} className="rounded-md bg-dark-800 px-3 py-2 text-sm text-dark-200">{collocation}</li>)}
                  </ul>
                </div>
                {active.entry.idiom && <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-3"><p className="text-xs font-bold uppercase text-amber-300">Related idiom</p><p className="mt-1 text-sm text-amber-100">{active.entry.idiom}</p></div>}
                <div className="rounded-md border border-cyan-500/20 bg-cyan-500/10 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase text-cyan-200"><Lightbulb size={14} /> Apply it</p>
                  <p className="mt-2 text-sm text-cyan-50">{active.entry.practicePrompt}</p>
                </div>
                {revealed && <div className="grid grid-cols-2 gap-2" aria-label="Rate recall quality">
                  {(['again', 'hard', 'good', 'easy'] as const).map((rating) => <button key={rating} type="button" onClick={() => rate(rating)} className="rounded-md border border-dark-700 bg-dark-800 px-3 py-2 text-sm font-semibold capitalize text-dark-100 transition-colors hover:border-primary-400 hover:text-white">{rating}</button>)}
                </div>}
              </aside>
            </div>
          </section>
        ) : (
          <section className="glass-card p-8 text-center" role="status"><Brain className="mx-auto text-primary-300" size={32} /><h2 className="mt-3 text-lg font-semibold text-white">Review queue is clear</h2><p className="mt-2 text-sm text-dark-400">Browse the curriculum below and return when the next review is due.</p></section>
        )}

        <section className="grid gap-3 sm:grid-cols-3" aria-label="IELTS vocabulary practice links">
          {[
            { to: '/app/practice-generator', label: 'Build a vocabulary activity', detail: 'Use the current topic as practice context when local generation becomes available.' },
            { to: '/app/ai-writing', label: 'Use words in writing', detail: 'Open the Writing Coach and practise the prompt from a reviewed entry.' },
            { to: '/app/ai-speaking', label: 'Use words in speaking', detail: 'Open the Speaking Coach and use a reviewed collocation in your answer.' },
          ].map((item) => <Link key={item.to} to={item.to} className="rounded-md border border-dark-700 bg-dark-900/45 p-4 transition-colors hover:border-primary-400/60"><p className="font-semibold text-white">{item.label}</p><p className="mt-2 text-sm text-dark-400">{item.detail}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-300">Open <ChevronRight size={15} /></span></Link>)}
        </section>

        <section className="glass-card p-5" aria-labelledby="library-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-primary-300">Deterministic curriculum</p><h2 id="library-heading" className="mt-1 text-lg font-semibold text-white">Vocabulary library</h2></div>
            <Link to="/app/practice-generator" className="inline-flex items-center gap-2 rounded-md border border-primary-500/35 px-3 py-2 text-sm font-semibold text-primary-200 transition-colors hover:bg-primary-500/10"><Sparkles size={16} /> Practice Generator</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a term, topic, or collocation" className="w-full rounded-md border border-dark-700 bg-dark-900 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-primary-400" /></label>
            <select aria-label="IELTS target band" value={band} onChange={(event) => setBand(event.target.value as IeltsVocabularyBand | 'all')} className="rounded-md border border-dark-700 bg-dark-900 px-3 py-2 text-sm text-white"><option value="all">All bands</option>{bands.slice(1).map((value) => <option key={value} value={value}>Band {value}</option>)}</select>
            <select aria-label="IELTS vocabulary topic" value={topic} onChange={(event) => setTopic(event.target.value as IeltsVocabularyTopic | 'all')} className="rounded-md border border-dark-700 bg-dark-900 px-3 py-2 text-sm text-white"><option value="all">All topics</option>{topics.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}</select>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((entry) => <article key={entry.id} className="rounded-md border border-dark-700 bg-dark-900/45 p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-white">{entry.term}</h3><span className="rounded bg-primary-500/15 px-2 py-0.5 text-xs font-bold text-primary-200">{entry.band}</span></div><p className="mt-2 text-sm text-dark-300">{entry.definition}</p><p className="mt-3 text-xs text-dark-500">{entry.topic} · {entry.collocations[0]}</p></article>)}
          </div>
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-dark-400">No curriculum entries match these filters.</p>}
        </section>

        <button type="button" onClick={() => { setProgress([]); saveProgress([]); setActiveIndex(0); setRevealed(false); }} className="inline-flex items-center gap-2 text-sm text-dark-400 transition-colors hover:text-white"><RotateCcw size={15} /> Reset this device's IELTS vocabulary progress</button>
      </div>
    </PageShell>
  );
}
