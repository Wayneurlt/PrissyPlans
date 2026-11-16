import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI commands (migrate, seed, studio) prefer the direct, non-pooled connection when one is set,
    // as Neon and other poolers recommend. The website itself always uses DATABASE_URL.
    // Read directly (not via env()) so `prisma generate` also works without a database configured.
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '',
    // Optional: only needed when the database user cannot create databases.
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
})
