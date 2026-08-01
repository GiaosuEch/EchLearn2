export type RuntimeBackendMode = 'supabase' | 'local';

export function resolveBackendMode(input: { url: string; anonKey: string; enabled?: boolean }): RuntimeBackendMode {
  const hasCredentials = Boolean(input.url && input.url.trim() && input.anonKey && input.anonKey.trim());
  if (input.enabled === false) return 'local';
  return hasCredentials ? 'supabase' : 'local';
}

