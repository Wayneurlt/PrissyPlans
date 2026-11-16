import { loginSchema } from '#shared/schemas/admin'

export default defineEventHandler(async (event) => {
  const input = await readValidatedBodyOrFail(event, loginSchema)
  const email = input.email.toLowerCase()

  await enforceRateLimit(event, { scope: 'login', limit: 5, windowSeconds: 15 * 60, identifier: email })

  const prisma = usePrisma()
  const admin = await prisma.adminUser.findUnique({ where: { email } })
  const valid = admin ? await verifyAdminPassword(admin.passwordHash, input.password) : false

  if (!admin || !valid || !admin.isActive) {
    // Same response for unknown email, wrong password and deactivated accounts.
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    loggedInAt: Date.now(),
  })

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
  await logActivity({ actorId: admin.id, action: 'auth.login', entityType: 'admin', entityId: admin.id, summary: `${admin.name} signed in` })

  return { ok: true, user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } }
})
