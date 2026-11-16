import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

let configured = false

export function isCloudinaryConfigured(): boolean {
  const { cloudinary: cfg } = useRuntimeConfig()
  return Boolean(cfg.cloudName && cfg.apiKey && cfg.apiSecret)
}

function getCloudinary() {
  const { cloudinary: cfg } = useRuntimeConfig()
  if (!isCloudinaryConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Image uploads are not configured',
      data: { message: 'Cloudinary credentials are missing. Add NUXT_CLOUDINARY_* variables to enable uploads.' },
    })
  }
  if (!configured) {
    cloudinary.config({ cloud_name: cfg.cloudName, api_key: cfg.apiKey, api_secret: cfg.apiSecret, secure: true })
    configured = true
  }
  return cloudinary
}

export interface UploadedImage {
  publicId: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  folder: string
}

export async function uploadImageBuffer(buffer: Buffer, options: { folder: string, filename?: string }): Promise<UploadedImage> {
  const client = getCloudinary()
  const { cloudinary: cfg } = useRuntimeConfig()
  const folder = `${cfg.folder || 'prissy-plans'}/${options.folder}`.replace(/\/+/g, '/')

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        unique_filename: true,
        use_filename: false,
        overwrite: false,
        // Strip metadata and cap very large originals; derived sizes are generated on request.
        transformation: [{ width: 2800, height: 2800, crop: 'limit' }],
      },
      (error, response) => {
        if (error || !response) return reject(error ?? new Error('Upload failed'))
        resolve(response)
      },
    )
    stream.end(buffer)
  })

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    folder,
  }
}

export async function deleteImageByPublicId(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return
  const client = getCloudinary()
  await client.uploader.destroy(publicId, { resource_type: 'image' }).catch((error) => {
    console.error('[cloudinary] delete failed', publicId, error)
  })
}
