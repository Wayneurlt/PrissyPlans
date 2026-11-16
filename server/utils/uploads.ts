import type { H3Event } from 'h3'
import type { MultiPartData } from 'h3'

export interface ValidatedUpload {
  filename: string
  mime: string
  data: Buffer
}

interface UploadRules {
  maxFiles: number
  maxBytes: number
  allowedMimeTypes: readonly string[]
}

/** Detects the real image type from magic bytes so a renamed file cannot bypass MIME checks. */
export function sniffImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg'
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png'
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  const brand = buffer.subarray(4, 8).toString('ascii')
  if (brand === 'ftyp') {
    const major = buffer.subarray(8, 12).toString('ascii')
    if (['avif', 'avis'].includes(major)) return 'image/avif'
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(major)) return 'image/heic'
  }
  return null
}

/**
 * Reads multipart image uploads and enforces count, size and content-type rules.
 * Throws 4xx errors with user-facing messages.
 */
export async function readImageUploads(event: H3Event, rules: UploadRules, fieldName = 'files'): Promise<ValidatedUpload[]> {
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (contentLength > rules.maxBytes * rules.maxFiles + 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Upload too large', data: { message: 'The upload is too large.' } })
  }

  const parts = await readMultipartFormData(event).catch(() => null)
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files received', data: { message: 'Choose at least one image to upload.' } })
  }

  const files = parts.filter((p: MultiPartData) => (p.name === fieldName || p.name === `${fieldName}[]`) && p.filename && p.data?.length)
  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files received', data: { message: 'Choose at least one image to upload.' } })
  }
  if (files.length > rules.maxFiles) {
    throw createError({ statusCode: 400, statusMessage: 'Too many files', data: { message: `You can upload up to ${rules.maxFiles} images at a time.` } })
  }

  const validated: ValidatedUpload[] = []
  for (const file of files) {
    if (file.data.length > rules.maxBytes) {
      const mb = Math.round(rules.maxBytes / (1024 * 1024))
      throw createError({ statusCode: 413, statusMessage: 'File too large', data: { message: `"${file.filename}" is larger than ${mb} MB.` } })
    }
    const sniffed = sniffImageMime(file.data)
    if (!sniffed || !rules.allowedMimeTypes.includes(sniffed)) {
      throw createError({ statusCode: 415, statusMessage: 'Unsupported file type', data: { message: `"${file.filename}" is not a supported image (JPEG, PNG, WebP${rules.allowedMimeTypes.includes('image/heic') ? ', HEIC' : ''}).` } })
    }
    validated.push({ filename: String(file.filename).slice(0, 200), mime: sniffed, data: file.data })
  }
  return validated
}
