import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/prisma/generated/client'

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient }

/**
 * Single PrismaClient per process. Prisma 7 talks to PostgreSQL through the
 * `pg` driver adapter; the connection string comes from DATABASE_URL.
 */
export function usePrisma(): PrismaClient {
  if (!globalForPrisma.__prisma) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure the database.')
    }
    // Pool size is configurable: the local `prisma dev` database works best with 1 connection,
    // hosted PostgreSQL can use more (serverless hosts usually want a small number).
    const max = Number(process.env.DATABASE_POOL_MAX) || 10
    const adapter = new PrismaPg({ connectionString, max })
    globalForPrisma.__prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
  }
  return globalForPrisma.__prisma
}

export type { PrismaClient }
