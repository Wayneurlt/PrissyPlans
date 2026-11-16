import { randomInt } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion

/** Human-friendly enquiry reference, e.g. PPE-2611-K7Q4M. */
export function generateEnquiryReference(date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  let code = ''
  for (let i = 0; i < 5; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return `PPE-${yy}${mm}-${code}`
}
