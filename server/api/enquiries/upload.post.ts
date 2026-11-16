import { ENQUIRY_UPLOAD } from '#shared/config/enquiry'

/** Inspiration image uploads for the enquiry form. Returns media ids to include in the submission. */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { scope: 'enquiry-upload', limit: 20, windowSeconds: 60 * 60 })
  if (!isCloudinaryConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Uploads unavailable',
      data: { message: 'Image uploads are temporarily unavailable. You can still submit your enquiry and share images on WhatsApp.' },
    })
  }
  const files = await readImageUploads(event, ENQUIRY_UPLOAD)
  const assets = await storeUploadedImages(files, { folder: 'enquiries', altText: 'Client inspiration image' })
  return assets.map(a => ({ id: a.id, url: a.url, width: a.width, height: a.height }))
})
