import { normalizeToolParams } from '../../src/request-params';

describe('normalizeToolParams', () => {
  it('returns empty object when params are missing', () => {
    expect(normalizeToolParams(undefined)).toEqual({});
    expect(normalizeToolParams(null)).toEqual({});
  });

  it('accepts object with string values', () => {
    expect(normalizeToolParams({ dryRun: 'true', prompt: 'hello' })).toEqual({
      dryRun: 'true',
      prompt: 'hello',
    });
  });

  it('rejects non-object params', () => {
    expect(() => normalizeToolParams('invalid')).toThrow('Invalid params');
    expect(() => normalizeToolParams(['invalid'])).toThrow('Invalid params');
  });

  it('rejects non-string values', () => {
    expect(() => normalizeToolParams({ targetMB: 200 })).toThrow("'targetMB' must be a string");
  });
});
