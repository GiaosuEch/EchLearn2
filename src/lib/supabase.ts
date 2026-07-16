import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type BackendMode = 'supabase' | 'local';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const normalizeSupabaseUrl = (url: string) => url.replace(/\/+$/, '');

const getConfigProblem = () => {
  if (!rawSupabaseUrl && !rawSupabaseAnonKey) return 'missing-env';
  if (!rawSupabaseUrl || !rawSupabaseAnonKey) return 'partial-env';
  if (rawSupabaseUrl.includes('/rest/v1')) return 'url-must-not-include-rest-v1';
  try {
    const parsed = new URL(rawSupabaseUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'invalid-url-protocol';
  } catch {
    return 'invalid-url';
  }
  if (/service[_-]?role/i.test(rawSupabaseAnonKey)) return 'service-role-key-is-forbidden-in-frontend';
  return null;
};

const configProblem = getConfigProblem();
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const supabase: SupabaseClient | null = configProblem
  ? null
  : createClient(supabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export const getBackendMode = (): BackendMode => (supabase ? 'supabase' : 'local');
export const isSupabaseConfigured = () => getBackendMode() === 'supabase';
export const getSupabaseConfigProblem = () => configProblem;
export const getSupabasePublicUrl = () => supabaseUrl;

if (configProblem && import.meta.env.DEV) {
  console.warn(`[Ech Lern] Supabase local fallback mode: ${configProblem}. End users do not configure Supabase; the app owner sets production env vars.`);
}
