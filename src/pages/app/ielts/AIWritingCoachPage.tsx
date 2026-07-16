import { useState } from 'react';
import { PenTool, ShieldAlert } from 'lucide-react';

import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import {
  analyzeWriting,
  type WritingAnalysisResult,
} from '../../../services/writingFeedback';

export default function AIWritingCoachPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WritingAnalysisResult | null>(null);

  const checkAvailability = async () => {
    if (!text.trim()) return;
    setResult(await analyzeWriting(text, 'writing-practice'));
  };

  return (
    <PageShell
      title="Writing Assessment"
      description="Automated assessment unavailable until an approved model is installed"
      icon={<PenTool size={20} />}
      backTo="/app/ielts"
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card flex min-h-[480px] flex-col p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Your writing</h3>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={16}
            placeholder="Write or paste a practice response here."
            className="w-full flex-1 resize-none rounded-xl border border-dark-700 bg-dark-900 p-5 text-sm leading-relaxed text-white outline-none transition-colors focus:border-primary-500"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-dark-400">
              {text.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              onClick={checkAvailability}
              disabled={!text.trim()}
              className="rounded-xl bg-dark-700 px-5 py-3 text-sm font-semibold text-dark-100 transition-colors hover:bg-dark-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check assessment availability
            </button>
          </div>
        </div>

        <section
          aria-live="polite"
          className="glass-card flex min-h-[480px] flex-col items-center justify-center p-8 text-center"
        >
          <Mascot expression="thinking" size={92} />
          <ShieldAlert className="mt-5 text-accent-400" size={28} aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-white">Writing assessment unavailable</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-dark-300">
            No approved local model or assessment runtime is installed. This page does not
            generate feedback, corrections, rewrites, or band scores.
          </p>
          {result && (
            <p className="mt-4 rounded-lg border border-dark-700 bg-dark-900 px-4 py-3 text-xs text-dark-400">
              Status: unavailable · {result.reason}
            </p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
