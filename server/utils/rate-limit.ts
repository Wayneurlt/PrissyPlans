import type { H3Event } from 'h3'

interface RateLimitOptions {
  /** Logical bucket, e.g. "login" or "enquiry". */
  scope: string
  /** Max requests per window. */
  limit: number
  /** Window length in seconds. */
  windowSeconds: number
  /** Optional identifier other than the client IP (e.g. an email). */
  identifier?: string
}

/**
 * Database-backed fixed-window rate limiter. Works across serverless instances
 * because the counters live in PostgreSQL rather than process memory.
 */
export async function enforceRateLimit(event: H3Event, options: RateLimitOptions): Promise<void> {
  const prisma = usePrisma()
  const ip = getClientIp(event)
  const id = options.identifier ? `${hashIp(ip)}:${options.identifier.toLowerCase()}` : hashIp(ip)
  const key = `${options.scope}:${id}`
  const now = new Date()
  const windowMs = options.windowSeconds * 1000

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } })
    const expired = !existing || now.getTime() - existing.windowStart.getTime() > windowMs

    if (expired) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      })
      return
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })

    if (updated.count > options.limit) {
      const retryAfter = Math.ceil((existing!.windowStart.getTime() + windowMs - now.getTime()) / 1000)
      setResponseHeader(event, 'Retry-After', Math.max(retryAfter, 1))
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests',
        data: { message: 'Too many attempts. Please wait a moment and try again.' },
      })
    }

    // Opportunistic cleanup of stale counters (cheap, occasional).
    if (Math.random() < 0.02) {
      await prisma.rateLimit.deleteMany({
        where: { windowStart: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
      }).catch(() => {})
    }
  }
  catch (error) {
    if ((error as { statusCode?: number }).statusCode === 429) throw error
    // If the limiter itself fails we log and let the request continue; the
    // request will still hit the database and surface a real error if needed.
    console.error('[rate-limit] failed', error)
  }
}
