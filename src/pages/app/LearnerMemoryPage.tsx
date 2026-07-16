import { BrainCircuit } from 'lucide-react';
import LearnerMemoryShell from '../../components/learning/LearnerMemoryShell';
import { useAppStore } from '../../stores/appStore';
import PageShell from '../PageShell';

export default function LearnerMemoryPage() {
  const targetLanguage = useAppStore((state) => state.currentLanguage);
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);

  return (
    <PageShell
      title="Learner Memory"
      description="Manage your local, consent-gated learner memory"
      icon={<BrainCircuit size={20} />}
      backTo="/app/practice"
    >
      <LearnerMemoryShell
        initialTargetLanguage={targetLanguage}
        initialNativeLanguage={nativeLanguage}
      />
    </PageShell>
  );
}
