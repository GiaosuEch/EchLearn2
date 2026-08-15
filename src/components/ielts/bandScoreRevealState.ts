export type BandRevealState = 'ready' | 'computing' | 'unavailable';
export type ResolvedBandRevealState = 'ready' | 'computing' | 'unavailable';

export interface BandRevealInput {
  state: BandRevealState;
  band?: number | null;
  scale: number;
}

/**
 * Pure state resolver for the IELTS Band reveal UI.
 *
 * State precedence is intentional:
 * 1. `computing` is authoritative while an evaluator is running; it does not
 *    require a result value yet.
 * 2. `unavailable` is authoritative when a capability/evidence path abstains.
 * 3. `ready` is accepted only with a finite value inside the declared scale.
 *
 * Invalid ready-state data fails closed to `unavailable`; it is never clamped,
 * guessed, or replaced with a default Band.
 */
export function resolveBandRevealState({
  state,
  band,
  scale,
}: BandRevealInput): ResolvedBandRevealState {
  if (state === 'computing') return 'computing';
  if (state === 'unavailable') return 'unavailable';

  const validScale = Number.isFinite(scale) && scale > 0;
  const validBand =
    typeof band === 'number' &&
    Number.isFinite(band) &&
    validScale &&
    band >= 0 &&
    band <= scale;

  return validBand ? 'ready' : 'unavailable';
}
