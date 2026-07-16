import { getBackendMode, isSupabaseConfigured, type BackendMode } from '../supabase';

export type DataMode = BackendMode;

export const getDataMode = (): DataMode => getBackendMode();
export const isLocalMode = () => !isSupabaseConfigured();
