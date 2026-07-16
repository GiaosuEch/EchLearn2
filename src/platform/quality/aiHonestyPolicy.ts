export type AIOutcomeMode = 'deterministic' | 'local-model';

export type AIHonestyPolicyErrorCode =
  | 'INVALID_OUTCOME'
  | 'FORBIDDEN_SIMULATION_MODE'
  | 'APPROVED_ARTIFACT_REQUIRED'
  | 'UNAVAILABLE_WITH_OUTPUT';

export type CompletedAIOutcome = {
  status: 'completed';
  mode: AIOutcomeMode;
  output: unknown;
  provenance: Record<string, unknown>;
  isAiGenerated: boolean;
};

export type UnavailableAIOutcome = {
  status: 'unavailable';
  mode: AIOutcomeMode;
  reason: string;
  isAiGenerated: false;
};

export type ValidatedAIOutcome = CompletedAIOutcome | UnavailableAIOutcome;

const FORBIDDEN_SIMULATION_MODES = new Set(['mock', 'random', 'hardcoded', 'canned']);

export class AIHonestyPolicyError extends Error {
  readonly code: AIHonestyPolicyErrorCode;

  constructor(code: AIHonestyPolicyErrorCode, message: string) {
    super(message);
    this.name = 'AIHonestyPolicyError';
    this.code = code;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requireMode(value: unknown): AIOutcomeMode {
  if (typeof value === 'string' && FORBIDDEN_SIMULATION_MODES.has(value)) {
    throw new AIHonestyPolicyError(
      'FORBIDDEN_SIMULATION_MODE',
      `Simulation mode "${value}" is forbidden.`,
    );
  }

  if (value === 'deterministic' || value === 'local-model') return value;
  throw new AIHonestyPolicyError('INVALID_OUTCOME', 'Outcome mode is invalid.');
}

export function validateAIOutcome(value: unknown): ValidatedAIOutcome {
  const input = asRecord(value);
  if (!input) throw new AIHonestyPolicyError('INVALID_OUTCOME', 'Outcome must be an object.');

  const mode = requireMode(input.mode);

  if (input.status === 'unavailable') {
    if ('output' in input) {
      throw new AIHonestyPolicyError(
        'UNAVAILABLE_WITH_OUTPUT',
        'Unavailable capabilities cannot contain output.',
      );
    }
    if (typeof input.reason !== 'string' || input.reason.length === 0) {
      throw new AIHonestyPolicyError('INVALID_OUTCOME', 'Unavailable reason is required.');
    }
    return { status: 'unavailable', mode, reason: input.reason, isAiGenerated: false };
  }

  if (input.status !== 'completed' || !('output' in input)) {
    throw new AIHonestyPolicyError('INVALID_OUTCOME', 'Completed output is required.');
  }

  const provenance = asRecord(input.provenance) ?? {};
  if (
    mode === 'local-model' &&
    (typeof provenance.artifactId !== 'string' || provenance.artifactId.length === 0)
  ) {
    throw new AIHonestyPolicyError(
      'APPROVED_ARTIFACT_REQUIRED',
      'Local-model output requires approved artifact provenance.',
    );
  }

  return {
    status: 'completed',
    mode,
    output: input.output,
    provenance,
    isAiGenerated: mode === 'local-model',
  };
}
