import { PenTool } from 'lucide-react';
import WritingCoachShell from '../../components/ai/WritingCoachShell';
import { useAppStore } from '../../stores/appStore';
import PageShell from '../PageShell';

export default function WritingCoachPage() {
  const targetLanguage = useAppStore((state) => state.currentLanguage);
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);

  return (
    <PageShell
      title="Writing Coach"
      description="Request local writing feedback when an approved model and runtime are ready"
      icon={<PenTool size={20} />}
      backTo="/app/practice"
    >
      <WritingCoachShell
        initialTargetLanguage={targetLanguage}
        initialNativeLanguage={nativeLanguage}
      />
    </PageShell>
  );
}
