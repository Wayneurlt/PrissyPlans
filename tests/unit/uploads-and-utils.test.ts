import { describe, expect, it } from 'vitest'
import { sniffImageMime } from '../../server/utils/uploads'
import { slugify } from '#shared/utils/format'

describe('sniffImageMime', () => {
  it('detects real image signatures', () => {
    expect(sniffImageMime(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('image/jpeg')
    expect(sniffImageMime(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0]))).toBe('image/png')
    expect(sniffImageMime(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]))).toBe('image/webp')
    expect(sniffImageMime(Buffer.concat([Buffer.alloc(4), Buffer.from('ftypheic')]))).toBe('image/heic')
  })

  it('rejects disguised or unknown files', () => {
    expect(sniffImageMime(Buffer.from('<?php echo "hi"; ?>'))).toBeNull()
    expect(sniffImageMime(Buffer.from('%PDF-1.7 something'))).toBeNull()
    expect(sniffImageMime(Buffer.from([1, 2, 3]))).toBeNull()
  })
})

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('Weddings & Engagements')).toBe('weddings-and-engagements')
    expect(slugify('  Café Soirée 2026!  ')).toBe('cafe-soiree-2026')
  })
})
