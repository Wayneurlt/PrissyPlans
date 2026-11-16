import { imageMetaSchema } from '#shared/schemas/admin'

/** Updates caption / alt text, or marks the image as the project cover (`{ cover: true }`). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') || ''
  const imageId = getRouterParam(event, 'imageId') || ''
  const body = await readBody(event).catch(() => ({})) as { cover?: boolean, caption?: string, altText?: string }
  const meta = imageMetaSchema.parse({ caption: body.caption, altText: body.altText })
  const prisma = usePrisma()
  const image = await prisma.portfolioImage.findFirst({ where: { id: imageId, projectId: id } })
  if (!image) throw createError({ statusCode: 404, statusMessage: 'Image not found' })

  if (meta.caption !== undefined) await prisma.portfolioImage.update({ where: { id: imageId }, data: { caption: meta.caption } })
  if (meta.altText !== undefined) await prisma.mediaAsset.update({ where: { id: image.mediaId }, data: { altText: meta.altText } })
  if (body.cover) await prisma.portfolioProject.update({ where: { id }, data: { coverMediaId: image.mediaId } })
  return { ok: true }
})
