import { ScrollText } from 'lucide-react';
import AIRequestAuditShell from '../../components/ai/AIRequestAuditShell';
import PageShell from '../PageShell';

export default function AIRequestAuditPage() {
  return (
    <PageShell
      title="AI Request Audit Log"
      description="Review local metadata-only request history and safety status"
      icon={<ScrollText size={20} />}
      backTo="/app/ai"
    >
      <AIRequestAuditShell />
    </PageShell>
  );
}
