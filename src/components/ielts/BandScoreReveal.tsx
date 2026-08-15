import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import Badge from '../ui/Badge';
import {
  resolveBandRevealState,
  type BandRevealState,
} from './bandScoreRevealState';

/**
 * BandScoreReveal — IELTS Product-Pack surface (NOT Platform Core).
 *
 * Presents an IELTS Band (0.0–9.0) that was ALREADY computed by the
 * deterministic math core (IELTSEvaluator.evaluatePronunciation / evaluateGrammar).
 *
 * NON-FABRICATION CONTRACT (AGENTS.md):
 *  - `band` is displayed exactly; the count-up only animates intermediate frames.
 *  - When `state === 'unavailable'` we render an explicit state — NO number,
 *    NO animation, NO fabricated success — with the real reason.
 *  - `evidence` shows the underlying mechanical figures (e.g. DTW raw %, AST depth).
 *  - `limitations` states honestly that this is mechanical scoring, not a human
 *    examiner or an AI judgement.
 */
export type { BandRevealState } from './bandScoreRevealState';

export interface BandEvidence {
  label: string;
  value: string;
}

export interface BandScoreRevealProps {
  state?: BandRevealState;
  /** Already-computed Band (0.0–9.0). Required when state === 'ready'. */
  band?: number | null;
  /** e.g. "IELTS Pronunciation Band". */
  label: string;
  /** Max of the scale (for the "/ 9.0" suffix and color thresholds). Default 9. */
  scale?: number;
  /** Underlying deterministic figures shown as evidence chips. */
  evidence?: BandEvidence[];
  /** Honest caveats about mechanical scoring. */
  limitations?: string[];
  /** Reason shown when state === 'unavailable'. */
  unavailableReason?: string;
  className?: string;
}

// Deterministic band → color. No randomness, no gradients.
function bandColor(band: number): string {
  if (band >= 7.0) return 'var(--ech-green-dark)';
  if (band >= 5.0) return 'var(--color-accent-600)';
  return 'var(--color-error)';
}

const surfaceStyle: React.CSSProperties = {
  background: 'var(--ech-surface-2)',
  border: '1px solid var(--ech-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 'var(--text-caption)',
  fontWeight: 700,
  letterSpacing: 'var(--tracking-wide)',
  textTransform: 'uppercase',
  color: 'var(--ech-text-muted)',
};

export default function BandScoreReveal({
  state = 'ready',
  band,
  label,
  scale = 9,
  evidence = [],
  limitations = [],
  unavailableReason,
  className,
}: BandScoreRevealProps) {
  const reducedMotion = useReducedMotion();
  const resolvedState = resolveBandRevealState({ state, band, scale });

  // ── Computing state — authoritative while the evaluator is running ────────
  // No Band exists yet by design, so this branch must precede result validation.
  if (resolvedState === 'computing') {
    return (
      <div className={className} style={surfaceStyle} role="status" aria-live="polite">
        <div style={eyebrowStyle}>{label}</div>
        <div
          className={reducedMotion ? undefined : 'skeleton'}
          style={{
            height: 64,
            width: 120,
            borderRadius: 'var(--radius-md)',
            marginTop: 'var(--space-3)',
            background: reducedMotion ? 'var(--ech-border)' : undefined,
          }}
          aria-label="Đang tính điểm bằng thuật toán"
        />
        <p style={{ marginTop: 'var(--space-3)', color: 'var(--ech-green-dark)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
          Đang chạy thuật toán…
        </p>
      </div>
    );
  }

  // ── Unavailable / invalid ready state — fail closed, never clamp ──────────
  if (resolvedState !== 'ready' || typeof band !== 'number') {
    return (
      <div className={className} style={surfaceStyle} role="status" aria-live="polite">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--ech-text-muted)', flexShrink: 0 }} />
          <div>
            <div style={eyebrowStyle}>{label}</div>
            <p style={{ margin: '4px 0 0', color: 'var(--ech-text)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              {unavailableReason ?? 'Chưa thể chấm điểm — chưa có dữ liệu đầu vào hợp lệ.'}
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Badge tone="neutral">Chưa khả dụng</Badge>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready state — reveal the exact validated Band ─────────────────────────
  const color = bandColor(band);

  return (
    <motion.div
      className={className}
      style={surfaceStyle}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <div style={eyebrowStyle}>{label}</div>
        <Badge tone="green">Chấm cơ học · Deterministic</Badge>
      </div>

      {/* font-size, weight and color inherit into AnimatedNumber's inner span,
          so the generic primitive stays size-agnostic. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-2)',
          color,
          fontSize: 'var(--text-display)',
          fontWeight: 800,
          lineHeight: 'var(--leading-tight)',
          letterSpacing: 'var(--tracking-tight)',
        }}
      >
        <AnimatedNumber
          value={band}
          decimals={1}
          durationMs={900}
          aria-label={`Band ${band.toFixed(1)} trên ${scale.toFixed(1)}`}
        />
        <span style={{ fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--ech-text-muted)' }}>
          / {scale.toFixed(1)}
        </span>
      </div>

      {evidence.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          {evidence.map((e) => (
            <Badge key={e.label} tone="neutral">
              {e.label}: <strong style={{ marginLeft: 4 }}>{e.value}</strong>
            </Badge>
          ))}
        </div>
      )}

      {limitations.length > 0 && (
        <ul
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--ech-border)',
            listStyle: 'none',
            display: 'grid',
            gap: 'var(--space-1)',
          }}
        >
          {limitations.map((limitation, i) => (
            <li key={i} style={{ fontSize: 'var(--text-caption)', color: 'var(--ech-text-muted)', lineHeight: 'var(--leading-snug)' }}>
              • {limitation}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
