import { useState, type FormEvent } from 'react';
import { Mic, Send } from 'lucide-react';
import { languages } from '../../data/languages';
import { detectAICapabilities } from '../../platform/ai/aiCapabilityDetector.ts';
import { createUnavailableAIService } from '../../platform/ai/aiService.ts';
import type { AIService } from '../../platform/ai/aiServiceTypes.ts';
import {
  createIdleSpeakingCoachViewModel,
  createSubmittingSpeakingCoachViewModel,
  executeSpeakingCoachRequest,
  type SpeakingCoachViewModel,
} from '../../platform/ai/speakingCoachViewModel.ts';
import {
  createInMemoryStorageAdapter,
  getSafeLocalStorageAdapter,
  readLearnerMemoryRecord,
  type LearnerMemoryStorageAdapter,
} from '../../platform/learning/learnerMemoryStore.ts';

const defaultSpeakingService = createUnavailableAIService({
  capabilityReport: detectAICapabilities(),
});

const speakingGoalOptions = [
  'conversation-practice',
  'everyday-communication',
  'presentation-practice',
  'vocabulary-use',
  'response-organization',
] as const;
const difficultyOptions = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'] as const;

export interface SpeakingCoachShellProps {
  aiService?: AIService;
  storage?: LearnerMemoryStorageAdapter;
  initialTargetLanguage?: string;
  initialNativeLanguage?: string;
}

function fallbackStorage(): LearnerMemoryStorageAdapter {
  return getSafeLocalStorageAdapter() ?? createInMemoryStorageAdapter();
}

export function SpeakingCoachShell({
  aiService = defaultSpeakingService,
  storage = fallbackStorage(),
  initialTargetLanguage = 'en',
  initialNativeLanguage = '',
}: SpeakingCoachShellProps) {
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage);
  const [nativeLanguage, setNativeLanguage] = useState(initialNativeLanguage);
  const [speakingGoal, setSpeakingGoal] = useState('conversation-practice');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [state, setState] = useState<SpeakingCoachViewModel>(
    createIdleSpeakingCoachViewModel,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!speakingGoal.trim() && !transcript.trim()) return;

    setState(createSubmittingSpeakingCoachViewModel());
    const learnerMemory = readLearnerMemoryRecord(storage);
    setState(await executeSpeakingCoachRequest(aiService, {
      targetLanguage,
      nativeLanguage,
      speakingGoal,
      difficulty,
      topic,
      transcript,
      learnerMemory,
    }));
  }

  const isSubmitting = state.status === 'submitting';

  return (
    <section className="max-w-3xl space-y-5" aria-label="Speaking Coach">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
            <Mic size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-50">Speaking Coach</h2>
            <p className="mt-1 text-sm leading-6 text-dark-300">
              Request language-learning feedback from optional transcript text. Output appears only when an approved local runtime and model are ready.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Target language</span>
              <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Native language</span>
              <select value={nativeLanguage} onChange={(event) => setNativeLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                <option value="">Not specified</option>
                {languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Speaking goal</span>
              <select value={speakingGoal} onChange={(event) => setSpeakingGoal(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {speakingGoalOptions.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {difficultyOptions.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-dark-200">Topic (optional)</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={120}
              placeholder="Add context for the speaking topic"
              className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2.5 text-sm text-dark-100 outline-none transition focus:border-primary-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-dark-200">Transcript (optional)</span>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={7}
              placeholder="Paste transcript text for feedback"
              className="mt-2 w-full resize-y rounded-lg border border-dark-700 bg-dark-950 px-3 py-2.5 text-sm leading-6 text-dark-100 outline-none transition focus:border-primary-500"
            />
          </label>

          <button type="submit" disabled={isSubmitting || (!speakingGoal.trim() && !transcript.trim())} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={16} aria-hidden="true" />
            {isSubmitting ? 'Checking availability…' : 'Check feedback availability'}
          </button>
        </form>
      </div>

      <section
        aria-live="polite"
        data-ai-generated={state.isAiGenerated ? 'true' : 'false'}
        className={`rounded-xl border p-5 ${state.status === 'success' ? 'border-primary-500/30 bg-primary-500/5' : 'border-dark-700 bg-dark-900'}`}
      >
        <h3 className="text-base font-semibold text-dark-50">{state.heading}</h3>
        <p className="mt-2 text-sm leading-6 text-dark-300">{state.description}</p>
        {state.status === 'success' && state.isAiGenerated === true && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-dark-700 bg-dark-950 p-4 text-sm leading-6 text-dark-100">{state.feedback}</p>
        )}
      </section>
    </section>
  );
}

export default SpeakingCoachShell;
