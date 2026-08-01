import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveBackendMode } from '../../src/lib/backendMode.ts';

describe('backend mode policy', () => {
  it('keeps development in local mode unless Supabase is explicitly enabled', () => {
    assert.equal(resolveBackendMode({ url: 'https://project.supabase.co', anonKey: 'public-key', enabled: false }), 'local');
  });

  it('only enables Supabase with a complete explicit configuration', () => {
    assert.equal(resolveBackendMode({ url: 'https://project.supabase.co', anonKey: 'public-key', enabled: true }), 'supabase');
    assert.equal(resolveBackendMode({ url: '', anonKey: 'public-key', enabled: true }), 'local');
  });
});
