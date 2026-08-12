/**
 * Structured Output Validator
 *
 * Validates AI/model output before the platform acts on it.
 * Rule: model output is untrusted data — parse, validate, never execute.
 */

export interface ValidationSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  properties?: Record<string, ValidationSchema>;
  items?: ValidationSchema;
  enum?: readonly (string | number)[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitized: unknown;
}

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

const DANGEROUS_PATTERNS = [
  /<script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i,
  /\beval\s*\(/i,
  /\bFunction\s*\(/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /;\s*(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)\s/i,
  /(\b|')OR\s+\d+\s*=\s*\d+/i,
  /--\s*$/m,
] as const;

function containsInjection(value: string): string | null {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      return `Contains potentially dangerous pattern: ${pattern.source}`;
    }
  }
  return null;
}

function validateValue(
  value: unknown,
  schema: ValidationSchema,
  path: string,
  errors: ValidationError[],
): unknown {
  if (value == null) {
    if (schema.required) {
      errors.push({ path, message: 'Required field is missing', value });
    }
    return value;
  }

  switch (schema.type) {
    case 'string': {
      if (typeof value !== 'string') {
        errors.push({ path, message: `Expected string, got ${typeof value}`, value });
        return undefined;
      }
      const injection = containsInjection(value);
      if (injection) {
        errors.push({ path, message: injection, value: '[redacted]' });
        return undefined;
      }
      if (schema.maxLength != null && value.length > schema.maxLength) {
        errors.push({
          path,
          message: `String exceeds max length ${schema.maxLength}`,
          value: value.length,
        });
        return value.slice(0, schema.maxLength);
      }
      if (schema.minLength != null && value.length < schema.minLength) {
        errors.push({ path, message: `String below min length ${schema.minLength}`, value: value.length });
        return value;
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push({ path, message: 'String does not match required pattern', value });
        return undefined;
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push({ path, message: `Value not in allowed set: ${schema.enum.join(', ')}`, value });
        return undefined;
      }
      return value;
    }

    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(num)) {
        errors.push({ path, message: `Expected finite number, got ${value}`, value });
        return undefined;
      }
      if (schema.min != null && num < schema.min) {
        errors.push({ path, message: `Number below minimum ${schema.min}`, value: num });
        return schema.min;
      }
      if (schema.max != null && num > schema.max) {
        errors.push({ path, message: `Number exceeds maximum ${schema.max}`, value: num });
        return schema.max;
      }
      return num;
    }

    case 'boolean': {
      if (typeof value !== 'boolean') {
        errors.push({ path, message: `Expected boolean, got ${typeof value}`, value });
        return undefined;
      }
      return value;
    }

    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push({ path, message: `Expected object, got ${Array.isArray(value) ? 'array' : typeof value}`, value });
        return undefined;
      }
      const record = value as Record<string, unknown>;
      const sanitized: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          sanitized[key] = validateValue(record[key], propSchema, `${path}.${key}`, errors);
        }
      }
      return sanitized;
    }

    case 'array': {
      if (!Array.isArray(value)) {
        errors.push({ path, message: `Expected array, got ${typeof value}`, value });
        return undefined;
      }
      if (!schema.items) return value;
      return value.map((item, i) => validateValue(item, schema.items!, `${path}[${i}]`, errors));
    }
  }

  return value;
}

export function validateStructuredOutput(
  data: unknown,
  schema: ValidationSchema,
  label = 'output',
): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitized = validateValue(data, schema, label, errors);
  return { valid: errors.length === 0, errors, sanitized };
}

export function parseAndValidateJSON(
  raw: string,
  schema: ValidationSchema,
  label = 'model-output',
): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          path: label,
          message: `Invalid JSON: ${err instanceof Error ? err.message : 'parse error'}`,
        },
      ],
      sanitized: undefined,
    };
  }
  return validateStructuredOutput(parsed, schema, label);
}

export const structuredOutputValidator = {
  validate: validateStructuredOutput,
  parseJSON: parseAndValidateJSON,
  containsInjection,
};
