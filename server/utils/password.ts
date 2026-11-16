import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto'

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derived) => (error ? reject(error) : resolve(derived)))
  })
}

const PARAMS = { N: 16384, r: 8, p: 1, keyLength: 64 }
const MAX_MEM = 64 * 1024 * 1024

/**
 * Password hashing with Node's built-in scrypt (no extra dependency).
 * Format: scrypt$N$r$p$<salt base64>$<hash base64>
 * Used by both the Nuxt server and the standalone admin-creation script.
 */
export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = await scrypt(password.normalize('NFKC'), salt, PARAMS.keyLength, { N: PARAMS.N, r: PARAMS.r, p: PARAMS.p, maxmem: MAX_MEM })
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${derived.toString('base64')}`
}

export async function verifyAdminPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    const [algo, n, r, p, saltB64, hashB64] = storedHash.split('$')
    if (algo !== 'scrypt' || !n || !r || !p || !saltB64 || !hashB64) return false
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const derived = await scrypt(password.normalize('NFKC'), salt, expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: MAX_MEM })
    return derived.length === expected.length && timingSafeEqual(derived, expected)
  }
  catch {
    return false
  }
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) return 'Use at least 10 characters.'
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Include upper-case, lower-case letters and a number.'
  }
  return null
}
