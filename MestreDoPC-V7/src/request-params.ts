export function normalizeToolParams(rawParams: unknown): Record<string, string> {
  if (rawParams === undefined || rawParams === null) {
    return {};
  }

  if (typeof rawParams !== 'object' || Array.isArray(rawParams)) {
    throw new Error('Invalid params: expected an object with string values');
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(`Invalid params: '${key}' must be a string`);
    }
    normalized[key] = value;
  }

  return normalized;
}
