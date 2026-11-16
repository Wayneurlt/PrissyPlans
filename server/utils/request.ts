import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

/** Best-effort client IP (trusts X-Forwarded-For set by the hosting platform). */
export function getClientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || '0.0.0.0'
}

/** Salted SHA-256 of the IP so raw addresses are never persisted. */
export function hashIp(ip: string): string {
  const salt = useRuntimeConfig().ipHashSalt || 'change-me'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

export function getUserAgent(event: H3Event): string | undefined {
  const ua = getRequestHeader(event, 'user-agent')
  return ua ? ua.slice(0, 500) : undefined
}

/** Parses a request body with a zod schema and converts failures into a 422 with field errors. */
export async function readValidatedBodyOrFail<T>(
  event: H3Event,
  schema: { safeParse: (data: unknown) => { success: true, data: T } | { success: false, error: { issues: Array<{ path: PropertyKey[], message: string }> } } },
): Promise<T> {
  const body = await readBody(event).catch(() => null)
  const result = schema.safeParse(body ?? {})
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.map(String).join('.') || '_form'
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { fieldErrors },
    })
  }
  return result.data
}
