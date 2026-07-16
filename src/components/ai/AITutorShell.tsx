import { useState, type FormEvent } from 'react';
import { Bot, Send } from 'lucide-react';
import { languages } from '../../data/languages';
import { detectAICapabilities } from '../../platform/ai/aiCapabilityDetector.ts';
import { createUnavailableAIService } from '../../platform/ai/aiService.ts';
import type { AIService } from '../../platform/ai/aiServiceTypes.ts';
import {
  createIdleAITutorViewModel,
  createSubmittingAITutorViewModel,
  executeAITutorRequest,
  type AITutorViewModel,
} from '../../platform/ai/aiTutorViewModel.ts';

const defaultTutorService = createUnavailableAIService({
  capabilityReport: detectAICapabilities(),
});

const skillOptions = ['conversation', 'grammar', 'vocabulary', 'listening', 'speaking', 'reading', 'writing'] as const;

export interface AITutorShellProps {
  aiService?: AIService;
  initialSourceLanguage?: string;
  initialTargetLanguage?: string;
  initialSkillArea?: string;
}

export function AITutorShell({
  aiService = defaultTutorService,
  initialSourceLanguage = '',
  initialTargetLanguage = 'en',
  initialSkillArea = 'conversation',
}: AITutorShellProps) {
  const [prompt, setPrompt] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(initialSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage);
  const [skillArea, setSkillArea] = useState(initialSkillArea);
  const [state, setState] = useState<AITutorViewModel>(createIdleAITutorViewModel);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(createSubmittingAITutorViewModel());
    setState(await executeAITutorRequest(aiService, {
      prompt,
      sourceLanguage,
      targetLanguage,
      skillArea,
    }));
  }

  const isSubmitting = state.status === 'submitting';

  return (
    <section className="max-w-3xl space-y-5" aria-label="AI Tutor">
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-50">Local AI Tutor</h2>
            <p className="mt-1 text-sm leading-6 text-dark-300">
              Ask a language-learning question. Responses appear only when an approved local runtime and model are ready.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-dark-200">Your question</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              required
              rows={4}
              placeholder="Ask for an explanation, example, or practice idea"
              className="mt-2 w-full resize-y rounded-lg border border-dark-700 bg-dark-950 px-3 py-2.5 text-sm text-dark-100 outline-none transition focus:border-primary-500"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Target language</span>
              <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Source language</span>
              <select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                <option value="">Not specified</option>
                {languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-dark-400">Skill area</span>
              <select value={skillArea} onChange={(event) => setSkillArea(event.target.value)} className="mt-2 w-full rounded-lg border border-dark-700 bg-dark-950 px-3 py-2 text-sm text-dark-100">
                {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
              </select>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={16} aria-hidden="true" />
            {isSubmitting ? 'Checking availability…' : 'Ask Local AI Tutor'}
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
        {state.status === 'success' && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-dark-700 bg-dark-950 p-4 text-sm leading-6 text-dark-100">{state.output}</p>
        )}
      </section>
    </section>
  );
}

export default AITutorShell;
