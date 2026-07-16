export type StructuredOutputErrorCode =
  | 'INVALID_JSON'
  | 'OBJECT_REQUIRED'
  | 'MISSING_FIELD'
  | 'UNEXPECTED_FIELD'
  | 'OUTPUT_TOO_LARGE'
  | 'INVALID_POLICY';

export type StructuredOutputPolicy = {
  requiredKeys: readonly string[];
  allowedKeys: readonly string[];
  maxSerializedLength: number;
};

export class StructuredOutputError extends Error {
  readonly code: StructuredOutputErrorCode;

  constructor(code: StructuredOutputErrorCode, message: string) {
    super(message);
    this.name = 'StructuredOutputError';
    this.code = code;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function serializedLength(value: unknown): number {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== 'string') throw new Error('not serializable');
    return serialized.length;
  } catch {
    throw new StructuredOutputError('OBJECT_REQUIRED', 'Structured output must be serializable.');
  }
}

export function validateStructuredOutput(
  value: unknown,
  policy: StructuredOutputPolicy,
): Record<string, unknown> {
  if (
    !Number.isSafeInteger(policy.maxSerializedLength) ||
    policy.maxSerializedLength <= 0 ||
    policy.requiredKeys.some((key) => !policy.allowedKeys.includes(key))
  ) {
    throw new StructuredOutputError('INVALID_POLICY', 'Structured output policy is invalid.');
  }

  let parsed: unknown = value;
  if (typeof value === 'string') {
    if (value.length > policy.maxSerializedLength) {
      throw new StructuredOutputError('OUTPUT_TOO_LARGE', 'Structured output exceeds its budget.');
    }
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      throw new StructuredOutputError('INVALID_JSON', 'Structured output is not valid JSON.');
    }
  }

  if (!isPlainObject(parsed)) {
    throw new StructuredOutputError('OBJECT_REQUIRED', 'Structured output must be an object.');
  }
  if (serializedLength(parsed) > policy.maxSerializedLength) {
    throw new StructuredOutputError('OUTPUT_TOO_LARGE', 'Structured output exceeds its budget.');
  }

  for (const key of policy.requiredKeys) {
    if (!(key in parsed)) {
      throw new StructuredOutputError('MISSING_FIELD', `Required field "${key}" is missing.`);
    }
  }
  for (const key of Object.keys(parsed)) {
    if (!policy.allowedKeys.includes(key)) {
      throw new StructuredOutputError('UNEXPECTED_FIELD', `Field "${key}" is not allowed.`);
    }
  }

  return parsed;
}
