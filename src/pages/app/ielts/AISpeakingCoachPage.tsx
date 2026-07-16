import { useState } from 'react';
import { Mic, ShieldAlert } from 'lucide-react';

import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import {
  analyzeSpeech,
  type SpeechAnalysisResult,
} from '../../../services/speechAnalysis';

export default function AISpeakingCoachPage() {
  const [result, setResult] = useState<SpeechAnalysisResult | null>(null);

  const checkAvailability = async () => {
    setResult(await analyzeSpeech(new Blob(), ''));
  };

  return (
    <PageShell
      title="Speaking Assessment"
      description="Automated assessment unavailable until an approved model is installed"
      icon={<Mic size={20} />}
      backTo="/app/ielts"
    >
      <section
        aria-live="polite"
        className="glass-card mx-auto flex max-w-2xl flex-col items-center p-8 text-center"
      >
        <Mascot expression="thinking" size={92} />
        <ShieldAlert className="mt-5 text-accent-400" size={28} aria-hidden="true" />
        <h3 className="mt-3 text-xl font-semibold text-white">Speaking assessment unavailable</h3>
        <p className="mt-3 max-w-lg text-sm leading-6 text-dark-300">
          No approved local speech model or assessment runtime is installed. Recording,
          pronunciation scoring, fluency scoring, and generated feedback are disabled.
        </p>
        <button
          type="button"
          onClick={checkAvailability}
          className="mt-6 rounded-xl border border-dark-600 bg-dark-800 px-5 py-3 text-sm font-semibold text-dark-100 transition-colors hover:bg-dark-700"
        >
          Check assessment availability
        </button>
        {result && (
          <p className="mt-4 rounded-lg border border-dark-700 bg-dark-900 px-4 py-3 text-xs text-dark-400">
            Status: unavailable · {result.reason}
          </p>
        )}
      </section>
    </PageShell>
  );
}
