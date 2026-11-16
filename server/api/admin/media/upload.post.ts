import { ADMIN_UPLOAD } from '#shared/config/enquiry'

/** Generic admin upload (testimonial photos, team photo). Query `folder` selects the Cloudinary sub-folder. */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  const folder = typeof query.folder === 'string' && /^[a-z0-9-]{1,40}$/.test(query.folder) ? query.folder : 'general'
  const files = await readImageUploads(event, { ...ADMIN_UPLOAD, maxFiles: 5 })
  const assets = await storeUploadedImages(files, { folder, uploadedById: admin.id })
  return assets.map(toPublicMedia)
})
