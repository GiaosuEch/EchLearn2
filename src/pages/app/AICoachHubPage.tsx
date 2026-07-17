import { BrainCircuit } from 'lucide-react';
import AICoachHubShell from '../../components/ai/AICoachHubShell';
import PageShell from '../PageShell';

export default function AICoachHubPage() {
  return (
    <PageShell
      title="AI Coach Hub"
      description="Open unavailable-safe learning shells and local learner-memory controls"
      icon={<BrainCircuit size={20} />}
      backTo="/app/practice"
    >
      <AICoachHubShell />
    </PageShell>
  );
}
