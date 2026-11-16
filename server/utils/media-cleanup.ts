/** Deletes a media asset (and its Cloudinary file) when nothing references it any more. */
export async function deleteMediaIfOrphaned(mediaId: string) {
  const prisma = usePrisma()
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      provider: true,
      isPlaceholder: true,
      _count: { select: { serviceCovers: true, serviceImages: true, portfolioCovers: true, portfolioImages: true, enquiryImages: true, testimonialPhoto: true } },
    },
  })
  if (!asset || asset.isPlaceholder) return
  const refs = Object.values(asset._count).reduce((a, b) => a + b, 0)
  if (refs > 0) return
  await deleteMediaAsset(asset.id)
}

/** Handles a Prisma unique-constraint error as a friendly 409. */
export function handleUniqueConflict(error: unknown, message = 'That slug is already in use'): never {
  const code = (error as { code?: string })?.code
  if (code === 'P2002') {
    throw createError({ statusCode: 409, statusMessage: 'Conflict', data: { fieldErrors: { slug: message } } })
  }
  throw error
}
