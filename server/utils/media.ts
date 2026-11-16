import type { MediaAsset } from '~~/prisma/generated/client'

/** Shape of a media asset as sent to the browser. */
export interface PublicMedia {
  id: string
  provider: 'CLOUDINARY' | 'EXTERNAL'
  url: string
  publicId: string | null
  width: number | null
  height: number | null
  altText: string | null
  isPlaceholder: boolean
}

export function toPublicMedia(media: MediaAsset | null | undefined): PublicMedia | null {
  if (!media) return null
  return {
    id: media.id,
    provider: media.provider,
    url: media.url,
    publicId: media.publicId,
    width: media.width,
    height: media.height,
    altText: media.altText,
    isPlaceholder: media.isPlaceholder,
  }
}

/** Uploads validated files to Cloudinary and records MediaAsset rows. */
export async function storeUploadedImages(files: ValidatedUpload[], options: { folder: string, uploadedById?: string | null, altText?: string }): Promise<MediaAsset[]> {
  const prisma = usePrisma()
  const created: MediaAsset[] = []
  for (const file of files) {
    const uploaded = await uploadImageBuffer(file.data, { folder: options.folder, filename: file.filename })
    const asset = await prisma.mediaAsset.create({
      data: {
        provider: 'CLOUDINARY',
        kind: 'IMAGE',
        publicId: uploaded.publicId,
        url: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        folder: uploaded.folder,
        altText: options.altText ?? file.filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        uploadedById: options.uploadedById ?? null,
      },
    })
    created.push(asset)
  }
  return created
}

/** Deletes a media row and its Cloudinary file (if it is a Cloudinary asset). */
export async function deleteMediaAsset(id: string) {
  const prisma = usePrisma()
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) return
  await prisma.mediaAsset.delete({ where: { id } })
  if (asset.provider === 'CLOUDINARY' && asset.publicId) {
    await deleteImageByPublicId(asset.publicId)
  }
}
