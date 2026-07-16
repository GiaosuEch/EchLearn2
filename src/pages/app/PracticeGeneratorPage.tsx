import { WandSparkles } from 'lucide-react';
import PracticeGeneratorShell from '../../components/ai/PracticeGeneratorShell';
import { useAppStore } from '../../stores/appStore';
import PageShell from '../PageShell';

export default function PracticeGeneratorPage() {
  const language = useAppStore((state) => state.currentLanguage);

  return (
    <PageShell
      title="Practice Generator"
      description="Configure a language activity and check local generation readiness"
      icon={<WandSparkles size={20} />}
      backTo="/app/practice"
    >
      <PracticeGeneratorShell initialLanguage={language} />
    </PageShell>
  );
}
