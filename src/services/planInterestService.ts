import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { localDb } from '../lib/storage/localDatabase';

export type PaidPlanId = 'go' | 'plus' | 'pro';

export interface PlanInterestRequest {
  id: string;
  userId: string;
  planId: PaidPlanId;
  status: 'requested' | 'contacted' | 'converted' | 'closed';
  requestedAt: string;
}

export interface PlanInterestResult {
  request: PlanInterestRequest;
  wasExisting: boolean;
}

const TABLE = 'plan_interest_requests';
const LOCAL_ID_PREFIX = 'plan_interest_';

function isPaidPlanId(value: unknown): value is PaidPlanId {
  return value === 'go' || value === 'plus' || value === 'pro';
}

function fromDb(row: Record<string, unknown>): PlanInterestRequest {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planId: isPaidPlanId(row.plan_id) ? row.plan_id : 'go',
    status: row.status === 'contacted' || row.status === 'converted' || row.status === 'closed' ? row.status : 'requested',
    requestedAt: String(row.requested_at),
  };
}

function readLocal(userId: string): PlanInterestRequest[] {
  return localDb.getTable<PlanInterestRequest>(TABLE).filter((request) => request.userId === userId);
}

function cache(request: PlanInterestRequest): PlanInterestRequest {
  const existing = localDb.getTable<PlanInterestRequest>(TABLE).find((entry) => entry.id === request.id);
  if (existing) localDb.update<PlanInterestRequest>(TABLE, existing.id, request);
  else localDb.insert<PlanInterestRequest>(TABLE, request);
  return request;
}

async function hasMatchingSession(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id === userId;
}

export async function listPlanInterest(userId: string): Promise<PlanInterestRequest[]> {
  const local = readLocal(userId);
  if (!(await hasMatchingSession(userId)) || !supabase) return local;

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, user_id, plan_id, status, requested_at')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });

  if (error || !data) return local;
  return data.map((row) => cache(fromDb(row)));
}

export async function requestPlanInterest(input: { userId: string; planId: PaidPlanId }): Promise<PlanInterestResult> {
  const existing = (await listPlanInterest(input.userId)).find((request) => request.planId === input.planId);
  if (existing) return { request: existing, wasExisting: true };

  const localRequest: PlanInterestRequest = {
    id: `${LOCAL_ID_PREFIX}${input.userId}_${input.planId}`,
    userId: input.userId,
    planId: input.planId,
    status: 'requested',
    requestedAt: new Date().toISOString(),
  };

  if (!(await hasMatchingSession(input.userId)) || !supabase) {
    return { request: cache(localRequest), wasExisting: false };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: input.userId, plan_id: input.planId })
    .select('id, user_id, plan_id, status, requested_at')
    .single();

  if (!error && data) return { request: cache(fromDb(data)), wasExisting: false };
  if (error?.code === '23505') {
    const duplicate = (await listPlanInterest(input.userId)).find((request) => request.planId === input.planId);
    if (duplicate) return { request: duplicate, wasExisting: true };
  }
  throw new Error(error?.message || 'Không thể gửi yêu cầu tư vấn.');
}
