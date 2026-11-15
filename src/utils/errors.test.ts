import { describe, expect, it } from 'vitest';
import { isAuthRequiredError } from './errors';

describe('isAuthRequiredError', () => {
  it.each([new Error('AUTH_REQUIRED'), { status: 401 }])(
    'recognizes authentication failures: %j',
    (error) => {
      expect(isAuthRequiredError(error)).toBe(true);
    },
  );

  it.each([undefined, null, 'AUTH_REQUIRED', new Error('Network error'), { status: 403 }, { status: '401' }])(
    'rejects unrelated or malformed errors: %j',
    (error) => {
      expect(isAuthRequiredError(error)).toBe(false);
    },
  );
});
