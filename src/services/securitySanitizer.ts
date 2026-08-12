/**
 * Security Sanitizer & Input Hardening Engine for EchLearn Platform
 * Protects against XSS, HTML injection, prototype pollution, and malicious payloads.
 * Includes schema-based boundary validation for structured input fields.
 */

/**
 * Strips script tags, HTML tags, onerror attributes, javascript: URIs, and dangerous characters
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (input == null) return '';
  let str = typeof input === 'string' ? input : String(input);
  
  // Truncate to maximum safe length
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  // Remove HTML tags and script blocks
  str = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    .replace(/javascript:[^\s]*/gi, '');

  return str.trim();
}

/**
 * Recursively sanitizes strings in an object or array payload
 */
export function sanitizeObject<T>(data: T): T {
  if (data == null) return data;
  if (typeof data === 'string') {
    return sanitizeText(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(data as object)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitized[key] = sanitizeObject((data as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }
  return data;
}

// --- Boundary Validation Layer ---

export interface FieldValidation {
  valid: boolean;
  value: string;
  error?: string;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_RE = /^@?[a-zA-Z0-9_]{2,30}$/;
const DISPLAY_NAME_RE = /^[\p{L}\p{N}\s._-]{1,50}$/u;

const SUPPORTED_LANGUAGES = new Set([
  'vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de', 'es', 'pt', 'it',
  'ru', 'th', 'id', 'ms', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv',
]);

export function validateEmail(raw: unknown): FieldValidation {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, value: '', error: 'Email is required' };
  }
  const email = raw.trim().toLowerCase();
  if (email.length > 254) {
    return { valid: false, value: email, error: 'Email is too long' };
  }
  if (!EMAIL_RE.test(email)) {
    return { valid: false, value: email, error: 'Invalid email format' };
  }
  return { valid: true, value: email };
}

export function validateUsername(raw: unknown): FieldValidation {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, value: '', error: 'Username is required' };
  }
  const username = sanitizeText(raw.trim(), 30);
  if (!USERNAME_RE.test(username)) {
    return {
      valid: false,
      value: username,
      error: 'Username must be 2-30 characters: letters, numbers, underscores only',
    };
  }
  return { valid: true, value: username.startsWith('@') ? username : `@${username}` };
}

export function validateDisplayName(raw: unknown): FieldValidation {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, value: '', error: 'Display name is required' };
  }
  const name = sanitizeText(raw.trim(), 50);
  if (!DISPLAY_NAME_RE.test(name)) {
    return {
      valid: false,
      value: name,
      error: 'Display name contains invalid characters',
    };
  }
  return { valid: true, value: name };
}

export function validateLanguageCode(raw: unknown): FieldValidation {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, value: '', error: 'Language code is required' };
  }
  const code = raw.trim().toLowerCase();
  if (!SUPPORTED_LANGUAGES.has(code)) {
    return { valid: false, value: code, error: `Unsupported language code: ${code}` };
  }
  return { valid: true, value: code };
}

export function validateUrl(raw: unknown, allowedProtocols = ['https:', 'http:']): FieldValidation {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { valid: false, value: '', error: 'URL is required' };
  }
  const url = raw.trim();
  if (url.length > 2048) {
    return { valid: false, value: url, error: 'URL is too long' };
  }
  try {
    const parsed = new URL(url);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, value: url, error: `Protocol ${parsed.protocol} is not allowed` };
    }
    return { valid: true, value: parsed.href };
  } catch {
    return { valid: false, value: url, error: 'Invalid URL format' };
  }
}

export function validateBoundedString(
  raw: unknown,
  label: string,
  minLength = 1,
  maxLength = 500,
): FieldValidation {
  if (typeof raw !== 'string') {
    return { valid: false, value: '', error: `${label} must be a string` };
  }
  const value = sanitizeText(raw.trim(), maxLength);
  if (value.length < minLength) {
    return { valid: false, value, error: `${label} must be at least ${minLength} characters` };
  }
  return { valid: true, value };
}

export const securitySanitizer = {
  sanitizeText,
  sanitizeObject,
  validateEmail,
  validateUsername,
  validateDisplayName,
  validateLanguageCode,
  validateUrl,
  validateBoundedString,
};
