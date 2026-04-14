/**
 * Write a logging subsystem failure to stderr (avoid `console.*` in library code).
 *
 * @param label - Short prefix.
 * @param err - Original error or value.
 */
export function writeMetaError(label: string, err: unknown): void {
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err)
  process.stderr.write(`[${label}] ${detail}\n`)
}
