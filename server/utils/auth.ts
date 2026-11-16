import type { H3Event } from 'h3'
import type { AdminRole } from '~~/prisma/generated/client'

export interface SessionAdmin {
  id: string
  email: string
  name: string
  role: AdminRole
}

/**
 * Server-side authorization for admin routes.
 * Requires a sealed session cookie AND an active admin record in the database,
 * so a deactivated account loses access immediately.
 */
export async function requireAdmin(event: H3Event): Promise<SessionAdmin> {
  const session = await requireUserSession(event)
  const user = session.user as SessionAdmin | undefined
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const prisma = usePrisma()
  const admin = await prisma.adminUser.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })

  if (!admin || !admin.isActive) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Session is no longer valid' })
  }

  return { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
}

export async function requireOwner(event: H3Event): Promise<SessionAdmin> {
  const admin = await requireAdmin(event)
  if (admin.role !== 'OWNER') {
    throw createError({ statusCode: 403, statusMessage: 'Owner access required' })
  }
  return admin
}
