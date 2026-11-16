/**
 * Creates or updates an admin user. There is no public registration.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name" --password "StrongPassw0rd" [--role OWNER]
 *
 * Or with environment variables: ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_ROLE.
 * Re-running with an existing email updates the name, password and role.
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/client'
import { hashAdminPassword, validatePasswordStrength } from '../server/utils/password'

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1]
  return undefined
}

async function main() {
  const email = (arg('email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const name = (arg('name') || process.env.ADMIN_NAME || '').trim()
  const password = arg('password') || process.env.ADMIN_PASSWORD || ''
  const role = (arg('role') || process.env.ADMIN_ROLE || 'OWNER').toUpperCase()

  if (!email || !email.includes('@')) throw new Error('A valid --email is required')
  if (!name) throw new Error('--name is required')
  const weak = validatePasswordStrength(password)
  if (weak) throw new Error(`Password too weak: ${weak}`)
  if (!['OWNER', 'ADMIN'].includes(role)) throw new Error('--role must be OWNER or ADMIN')

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

  try {
    const passwordHash = await hashAdminPassword(password)
    const user = await prisma.adminUser.upsert({
      where: { email },
      create: { email, name, passwordHash, role: role as 'OWNER' | 'ADMIN', isActive: true },
      update: { name, passwordHash, role: role as 'OWNER' | 'ADMIN', isActive: true },
    })
    console.log(`Admin ready: ${user.email} (${user.role}). Sign in at /admin/login.`)
  }
  finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
