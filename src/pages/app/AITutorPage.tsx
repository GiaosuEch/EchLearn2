import { Brain } from 'lucide-react';
import PageShell from '../PageShell';
import AITutorShell from '../../components/ai/AITutorShell';
import { useAppStore } from '../../stores/appStore';

export default function AITutorPage() {
  const targetLanguage = useAppStore((state) => state.currentLanguage);
  const sourceLanguage = useAppStore((state) => state.nativeLanguage);

  return (
    <PageShell
      title="Local AI Tutor"
      description="Ask language-learning questions when an approved local runtime is ready"
      icon={<Brain size={20} />}
      backTo="/app"
    >
      <AITutorShell
        initialTargetLanguage={targetLanguage}
        initialSourceLanguage={sourceLanguage}
      />
    </PageShell>
  );
}
