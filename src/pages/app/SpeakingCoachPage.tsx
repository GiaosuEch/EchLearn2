import { Mic } from 'lucide-react';
import SpeakingCoachShell from '../../components/ai/SpeakingCoachShell';
import { useAppStore } from '../../stores/appStore';
import PageShell from '../PageShell';

export default function SpeakingCoachPage() {
  const targetLanguage = useAppStore((state) => state.currentLanguage);
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);

  return (
    <PageShell
      title="Speaking Coach"
      description="Request local speaking feedback when an approved model and runtime are ready"
      icon={<Mic size={20} />}
      backTo="/app/practice"
    >
      <SpeakingCoachShell
        initialTargetLanguage={targetLanguage}
        initialNativeLanguage={nativeLanguage}
      />
    </PageShell>
  );
}
