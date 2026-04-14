/**
 * Reads `code` from framework-style errors without `instanceof` across packages.
 *
 * @param err - Caught value.
 * @returns Code string when present.
 */
export function readAtlexErrorCode(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null || !('code' in err)) {
    return undefined
  }
  const c = (err as { code: unknown }).code
  return typeof c === 'string' ? c : undefined
}
