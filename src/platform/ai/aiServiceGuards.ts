import {
  AI_SERVICE_REQUEST_TYPES,
  type AIServiceRequest,
  type AIServiceRequestType,
  type AIServiceResponse,
} from './aiServiceTypes.ts';

export type AIServiceRequestValidationError =
  | 'request-not-object'
  | 'request-id-invalid'
  | 'invalid-request-type'
  | 'input-required'
  | 'input-invalid'
  | 'context-invalid'
  | 'language-context-invalid'
  | 'skill-context-invalid';

export type AIServiceResponseValidationError =
  | 'response-not-object'
  | 'response-status-invalid'
  | 'request-type-invalid'
  | 'output-required'
  | 'output-not-allowed'
  | 'generation-flag-invalid'
  | 'ai-provenance-required'
  | 'provenance-invalid'
  | 'limitations-invalid'
  | 'safety-invalid';

export type AIServiceRequestValidation =
  | { valid: true; value: AIServiceRequest }
  | { valid: false; errors: AIServiceRequestValidationError[] };

export type AIServiceResponseValidation =
  | { valid: true; value: AIServiceResponse }
  | { valid: false; errors: AIServiceResponseValidationError[] };

const inputRequiredTypes = new Set<AIServiceRequestType>([
  'conversation',
  'explain',
  'feedback',
  'summarize',
  'classify',
  'assess',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError<T extends string>(errors: T[], error: T): void {
  if (!errors.includes(error)) errors.push(error);
}

function isLanguageTag(value: unknown): boolean {
  return (
    typeof value === 'string'
    && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value)
  );
}

function isSkillArea(value: unknown): boolean {
  return (
    typeof value === 'string'
    && /^[a-z][a-z0-9-]{1,63}$/i.test(value)
  );
}

export function isAIServiceRequestType(value: unknown): value is AIServiceRequestType {
  return (
    typeof value === 'string'
    && (AI_SERVICE_REQUEST_TYPES as readonly string[]).includes(value)
  );
}

function validateContext(
  value: unknown,
  errors: AIServiceRequestValidationError[],
): void {
  if (value === undefined) return;

  if (!isRecord(value)) {
    addError(errors, 'context-invalid');
    return;
  }

  for (const key of ['sourceLanguage', 'targetLanguage'] as const) {
    if (value[key] !== undefined && !isLanguageTag(value[key])) {
      addError(errors, 'language-context-invalid');
    }
  }

  if (value.skillArea !== undefined && !isSkillArea(value.skillArea)) {
    addError(errors, 'skill-context-invalid');
  }

  if (
    value.learnerLevel !== undefined
    && (
      typeof value.learnerLevel !== 'string'
      || !/^[a-z0-9][a-z0-9._-]{0,31}$/i.test(value.learnerLevel)
    )
  ) {
    addError(errors, 'context-invalid');
  }
}

export function validateAIServiceRequest(
  value: unknown,
): AIServiceRequestValidation {
  if (!isRecord(value)) {
    return { valid: false, errors: ['request-not-object'] };
  }

  const errors: AIServiceRequestValidationError[] = [];

  if (!nonEmpty(value.requestId) || value.requestId.length > 128) {
    addError(errors, 'request-id-invalid');
  }

  if (!isAIServiceRequestType(value.type)) {
    addError(errors, 'invalid-request-type');
  }

  if (
    isAIServiceRequestType(value.type)
    && inputRequiredTypes.has(value.type)
    && !nonEmpty(value.input)
  ) {
    addError(errors, 'input-required');
  } else if (
    value.input !== undefined
    && typeof value.input !== 'string'
  ) {
    addError(errors, 'input-invalid');
  }

  validateContext(value.context, errors);

  return errors.length === 0
    ? { valid: true, value: value as unknown as AIServiceRequest }
    : { valid: false, errors };
}

function hasCompleteRuntimeProvenance(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    nonEmpty(value.modelArtifactId)
    && nonEmpty(value.modelArtifactVersion)
    && nonEmpty(value.runtimeId)
    && nonEmpty(value.runtimeVersion)
  );
}

function hasValidBaseProvenance(value: unknown): boolean {
  return (
    isRecord(value)
    && nonEmpty(value.serviceId)
    && nonEmpty(value.serviceVersion)
  );
}

function hasValidLimitations(value: unknown): boolean {
  return (
    isRecord(value)
    && Array.isArray(value.codes)
    && value.codes.every(code => typeof code === 'string')
  );
}

function hasValidSafety(value: unknown): boolean {
  return (
    isRecord(value)
    && ['not-evaluated', 'passed', 'blocked'].includes(String(value.status))
    && Array.isArray(value.reasons)
    && value.reasons.every(reason => typeof reason === 'string')
  );
}

export function validateAIServiceResponse(
  value: unknown,
): AIServiceResponseValidation {
  if (!isRecord(value)) {
    return { valid: false, errors: ['response-not-object'] };
  }

  const errors: AIServiceResponseValidationError[] = [];
  const validStatus = ['success', 'unavailable', 'needs-model', 'failed']
    .includes(String(value.status));

  if (!validStatus) addError(errors, 'response-status-invalid');
  if (
    !isAIServiceRequestType(value.requestType)
    && !(value.status === 'failed' && value.requestType === 'unknown')
  ) {
    addError(errors, 'request-type-invalid');
  }

  if (value.status === 'success') {
    if (
      !isRecord(value.output)
      || !nonEmpty(value.output.text)
    ) {
      addError(errors, 'output-required');
    }
  } else if (Object.hasOwn(value, 'output')) {
    addError(errors, 'output-not-allowed');
  }

  if (value.status === 'success' && value.isAiGenerated !== true) {
    addError(errors, 'generation-flag-invalid');
  }

  if (value.status !== 'success' && value.isAiGenerated !== false) {
    addError(errors, 'generation-flag-invalid');
  }

  if (
    value.isAiGenerated === true
    && !hasCompleteRuntimeProvenance(value.provenance)
  ) {
    addError(errors, 'ai-provenance-required');
  }

  if (!hasValidBaseProvenance(value.provenance)) {
    addError(errors, 'provenance-invalid');
  }

  if (!hasValidLimitations(value.limitations)) {
    addError(errors, 'limitations-invalid');
  }

  if (!hasValidSafety(value.safety)) {
    addError(errors, 'safety-invalid');
  }

  return errors.length === 0
    ? { valid: true, value: value as unknown as AIServiceResponse }
    : { valid: false, errors };
}
