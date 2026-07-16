import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  StructuredOutputError,
  validateStructuredOutput,
} from '../../src/platform/quality/structuredOutput.ts';

const policy = {
  requiredKeys: ['message', 'evidenceIds'],
  allowedKeys: ['message', 'evidenceIds'],
  maxSerializedLength: 200,
};

describe('structured output validation', () => {
  it('parses a bounded object and preserves validated fields', () => {
    const result = validateStructuredOutput(
      JSON.stringify({ message: 'Review this example.', evidenceIds: ['e-1'] }),
      policy,
    );

    assert.deepEqual(result, { message: 'Review this example.', evidenceIds: ['e-1'] });
  });

  it('rejects malformed JSON and non-object values', () => {
    assert.throws(
      () => validateStructuredOutput('{broken', policy),
      (error) => error instanceof StructuredOutputError && error.code === 'INVALID_JSON',
    );
    assert.throws(
      () => validateStructuredOutput('[]', policy),
      (error) => error instanceof StructuredOutputError && error.code === 'OBJECT_REQUIRED',
    );
  });

  it('rejects missing or unexpected fields', () => {
    assert.throws(
      () => validateStructuredOutput({ message: 'Missing evidence.' }, policy),
      (error) => error instanceof StructuredOutputError && error.code === 'MISSING_FIELD',
    );
    assert.throws(
      () =>
        validateStructuredOutput(
          { message: 'Extra field.', evidenceIds: [], execute: 'delete-data' },
          policy,
        ),
      (error) => error instanceof StructuredOutputError && error.code === 'UNEXPECTED_FIELD',
    );
  });

  it('rejects output larger than the declared budget', () => {
    assert.throws(
      () =>
        validateStructuredOutput(
          { message: 'x'.repeat(250), evidenceIds: [] },
          policy,
        ),
      (error) => error instanceof StructuredOutputError && error.code === 'OUTPUT_TOO_LARGE',
    );
  });
});
