import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../..', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

test('a paid-plan request is persisted through an owner-scoped Supabase service', () => {
  const service = read('src/services/planInterestService.ts');
  const pricingPage = read('src/pages/app/PricingPage.tsx');
  const migration = read('supabase/migrations/20260809023534_create_plan_interest_requests.sql');

  assert.match(service, /const TABLE = 'plan_interest_requests'/);
  assert.match(service, /\.from\(TABLE\)/);
  assert.match(service, /requestPlanInterest/);
  assert.match(pricingPage, /requestPlanInterest/);
  assert.match(pricingPage, /Đã gửi yêu cầu tư vấn/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /to authenticated/);
  assert.match(migration, /\(select auth\.uid\(\)\) = user_id/);
  assert.doesNotMatch(pricingPage, /Đang kết nối tới cổng thanh toán/);
});
