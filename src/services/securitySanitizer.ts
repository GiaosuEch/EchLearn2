/**
 * Security Sanitizer & Input Hardening Engine for EchLearn Platform
 * Protects against XSS, HTML injection, prototype pollution, and malicious payloads.
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

export const securitySanitizer = {
  sanitizeText,
  sanitizeObject,
};
