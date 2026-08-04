import { CustomEmoji } from './CustomEmoji';
import { useProAccess } from '../../hooks/useProAccess';

interface ProBadgeProps {
  /** Render even when the account is not PRO (shows the tier it actually has). */
  showWhenFree?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const TIER_LABEL: Record<string, string> = {
  free: 'FREE',
  go: 'GO',
  plus: 'PLUS',
  pro: 'PRO',
};

/**
 * The PRO badge reads `useProAccess` rather than `user.subscriptionTier` so it
 * lights up the moment the admin grants PRO, without a re-login.
 */
export function ProBadge({ showWhenFree = false, size = 'sm', className = '' }: ProBadgeProps) {
  const { flags, plan, role } = useProAccess();

  if (!flags.showProBadge && !showWhenFree) return null;

  const isAdmin = role === 'admin';
  const label = isAdmin ? 'ADMIN · PRO' : TIER_LABEL[plan] ?? 'FREE';
  const iconSize = size === 'md' ? 18 : 14;

  const tone = flags.showProBadge
    ? 'border-amber-500/50 border-b-amber-600 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950'
    : 'border-slate-300 border-b-slate-400 bg-slate-100 text-slate-600 dark:border-slate-700 dark:border-b-slate-800 dark:bg-slate-800 dark:text-slate-300';

  return (
    <span
      title={flags.showProBadge ? 'Tài khoản PRO — mở khóa toàn bộ tính năng' : `Gói hiện tại: ${label}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tone} ${
        size === 'md' ? 'text-xs px-3 py-1.5' : ''
      } ${className}`}
    >
      <CustomEmoji name={flags.showProBadge ? 'league-crown' : 'verified-check'} size={iconSize} />
      {label}
    </span>
  );
}

export default ProBadge;
