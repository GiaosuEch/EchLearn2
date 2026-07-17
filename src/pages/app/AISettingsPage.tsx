import { SlidersHorizontal } from 'lucide-react';
import AISettingsShell from '../../components/ai/AISettingsShell';
import PageShell from '../PageShell';

export default function AISettingsPage() {
  return (
    <PageShell
      title="AI Settings and Privacy"
      description="Manage local preferences and review consent and metadata controls"
      icon={<SlidersHorizontal size={20} />}
      backTo="/app/ai"
    >
      <AISettingsShell />
    </PageShell>
  );
}
