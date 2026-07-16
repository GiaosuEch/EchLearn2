import { useState, type FormEvent } from 'react';
import { Send, WandSparkles } from 'lucide-react';
import { languages } from '../../data/languages';
import { detectAICapabilities } from '../../platform/ai/aiCapabilityDetector.ts';
import { createUnavailableAIService } from '../../platform/ai/aiService.ts';
import type { AIService } from '../../platform/ai/aiServiceTypes.ts';
import {
  createIdlePracticeGeneratorViewModel,
  createSubmittingPracticeGeneratorViewModel,
  executePracticeGeneratorRequest,
  type PracticeGeneratorViewModel,
} from '../../platform/ai/practiceGeneratorViewModel.ts';

const defaultPracticeService = createUnavailableAIService({
  capabilityReport: detectAICapabilities(),
});

const skillOptions = ['vocabulary', 'grammar', 'listening', 'reading', 'writing', 'speaking'] as const;
const difficultyOptions = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'] as const;
const exerciseOptions = ['multiple-choice', 'fill-in-the-blank', 'short-answer', 'sentence-building', 'guided-response'] as const;

export interface PracticeGeneratorShellProps {
  aiService?: AIService;
  initialLanguage?: string;
  initialSkillArea?: string;
}

export function PracticeGeneratorShell({
  aiService = defaultPracticeService,
  initialLanguage = 'en',
  initialSkillArea = 'vocabulary',
}: PracticeGeneratorShellProps) {
  const [language, setLanguage] = useState(initialLanguage);
  const [skillArea, setSkillArea] = useState(initialSkillArea);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [topic, setTopic] = useState('');
  const [exerciseType, setExerciseType] = useState('short-answer');
  const [state, setState] = useState<PracticeGeneratorViewModel>(
    createIdlePracticeGeneratorViewModel,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(createSubmittingPracticeGeneratorViewModel());
    setState(await executePracticeGeneratorRequest(aiService, {
      language,
      skillArea,
      difficulty,
      topic,
      exerciseType,
    }));
  }

  const isSubmitting = state.status === 'submitting';

  return (
    <section className="max-w-3xl space-y-5" aria-label="Practice Generator">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
            <WandSparkles size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-50">Practice Generator</h2>
            <p className="mt-1 text-sm leading-6 text-dark-300">
              Configure a language activity. Output appears only when an approved local runtime and model are ready.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {languages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Skill area</span>
              <select value={skillArea} onChange={(event) => setSkillArea(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Difficulty</span>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {difficultyOptions.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Exercise type</span>
              <select value={exerciseType} onChange={(event) => setExerciseType(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {exerciseOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-dark-200">Topic <span className="text-dark-500">(optional)</span></span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={120}
              placeholder="For example: ordering food or planning a trip"
              className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2.5 text-sm text-dark-100 outline-none transition focus:border-primary-500"
            />
          </label>

          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={16} aria-hidden="true" />
            {isSubmitting ? 'Checking availability…' : 'Request practice activity'}
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
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-dark-700 bg-dark-950 p-4 text-sm leading-6 text-dark-100">{state.output}</p>
        )}
      </section>
    </section>
  );
}

export default PracticeGeneratorShell;
