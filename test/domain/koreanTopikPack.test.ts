import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KOREAN_TOPIK1_PACK,
  getRegisteredProductPack,
  validateProductPackManifest,
} from '../../src/packs/koreanTopik1Pack.ts';

test('TOPIK starter pack has a published, local-only manifest with honest claims', () => {
  assert.deepEqual(validateProductPackManifest(KOREAN_TOPIK1_PACK), []);
  assert.equal(KOREAN_TOPIK1_PACK.id, 'ko-topik1-starter');
  assert.equal(KOREAN_TOPIK1_PACK.version, '1.0.0');
  assert.equal(KOREAN_TOPIK1_PACK.publicationState, 'published');
  assert.equal(KOREAN_TOPIK1_PACK.contentDelivery, 'local-static');
  assert.equal(KOREAN_TOPIK1_PACK.claim, 'starter-foundations');
  assert.match(KOREAN_TOPIK1_PACK.disclosure, /không phải.*coverage.*TOPIK I/i);
});

test('TOPIK pack can be resolved through the product-pack gateway', () => {
  assert.equal(getRegisteredProductPack('ko-topik1-starter'), KOREAN_TOPIK1_PACK);
  assert.equal(getRegisteredProductPack('missing-pack'), undefined);
});
