export type EvaluationScope = 'platform' | 'learning' | 'pack';
export type CalibrationStatus = 'not-applicable' | 'internal' | 'calibrated';

export type EvaluationBenchmarkCase = {
  caseId: string;
  inputRef: string;
  expectedBehaviors: string[];
};

export type EvaluationBenchmark = {
  benchmarkId: string;
  version: string;
  scope: EvaluationScope;
  rubricVersion: string;
  promotionThreshold: number;
  calibrationStatus: CalibrationStatus;
  calibrationRecordId?: string;
  cases: EvaluationBenchmarkCase[];
};

export type EvaluationBenchmarkErrorCode =
  | 'INVALID_BENCHMARK'
  | 'CASES_REQUIRED'
  | 'DUPLICATE_CASE'
  | 'INVALID_THRESHOLD'
  | 'INVALID_CALIBRATION_STATUS';

export class EvaluationBenchmarkError extends Error {
  readonly code: EvaluationBenchmarkErrorCode;

  constructor(code: EvaluationBenchmarkErrorCode, message: string) {
    super(message);
    this.name = 'EvaluationBenchmarkError';
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateEvaluationBenchmark(value: unknown): EvaluationBenchmark {
  if (!isRecord(value)) {
    throw new EvaluationBenchmarkError('INVALID_BENCHMARK', 'Benchmark must be an object.');
  }

  if (
    !isNonEmptyString(value.benchmarkId) ||
    !isNonEmptyString(value.version) ||
    !isNonEmptyString(value.rubricVersion) ||
    !['platform', 'learning', 'pack'].includes(String(value.scope))
  ) {
    throw new EvaluationBenchmarkError('INVALID_BENCHMARK', 'Benchmark identity is invalid.');
  }

  if (
    typeof value.promotionThreshold !== 'number' ||
    !Number.isFinite(value.promotionThreshold) ||
    value.promotionThreshold < 0 ||
    value.promotionThreshold > 1
  ) {
    throw new EvaluationBenchmarkError('INVALID_THRESHOLD', 'Threshold must be between zero and one.');
  }

  const calibrationStatus = value.calibrationStatus;
  if (
    calibrationStatus !== 'not-applicable' &&
    calibrationStatus !== 'internal' &&
    calibrationStatus !== 'calibrated'
  ) {
    throw new EvaluationBenchmarkError(
      'INVALID_CALIBRATION_STATUS',
      'Benchmark calibration status must be explicit and non-official.',
    );
  }
  if (calibrationStatus === 'calibrated' && !isNonEmptyString(value.calibrationRecordId)) {
    throw new EvaluationBenchmarkError(
      'INVALID_CALIBRATION_STATUS',
      'Calibrated benchmarks require a calibration record.',
    );
  }

  if (!Array.isArray(value.cases) || value.cases.length === 0) {
    throw new EvaluationBenchmarkError('CASES_REQUIRED', 'At least one evaluation case is required.');
  }

  const caseIds = new Set<string>();
  const cases: EvaluationBenchmarkCase[] = [];
  for (const item of value.cases) {
    if (
      !isRecord(item) ||
      !isNonEmptyString(item.caseId) ||
      !isNonEmptyString(item.inputRef) ||
      !Array.isArray(item.expectedBehaviors) ||
      item.expectedBehaviors.length === 0 ||
      item.expectedBehaviors.some((behavior) => !isNonEmptyString(behavior))
    ) {
      throw new EvaluationBenchmarkError('INVALID_BENCHMARK', 'Evaluation case is invalid.');
    }
    if (caseIds.has(item.caseId)) {
      throw new EvaluationBenchmarkError('DUPLICATE_CASE', `Duplicate case "${item.caseId}".`);
    }
    caseIds.add(item.caseId);
    cases.push({
      caseId: item.caseId,
      inputRef: item.inputRef,
      expectedBehaviors: [...item.expectedBehaviors] as string[],
    });
  }

  return {
    benchmarkId: value.benchmarkId,
    version: value.version,
    scope: value.scope as EvaluationScope,
    rubricVersion: value.rubricVersion,
    promotionThreshold: value.promotionThreshold,
    calibrationStatus,
    ...(typeof value.calibrationRecordId === 'string'
      ? { calibrationRecordId: value.calibrationRecordId }
      : {}),
    cases,
  };
}
