<script setup lang="ts">
/**
 * Manages a gallery for a portfolio project or service:
 * upload (multi-file), set cover, reorder, caption (portfolio only) and delete.
 */
interface GalleryImage {
  id: string
  caption?: string | null
  sortOrder: number
  media: { id: string, url: string, provider: string, publicId: string | null, altText: string | null, isPlaceholder: boolean } | null
}

const props = defineProps<{
  endpoint: string
  images: GalleryImage[]
  coverMediaId: string | null
  uploadsEnabled: boolean
  withCaptions?: boolean
}>()
const emit = defineEmits<{ changed: [] }>()

const toast = useToast()
const uploading = ref(false)
const busyId = ref<string | null>(null)
const list = ref<GalleryImage[]>([])
watch(() => props.images, v => { list.value = [...v] }, { immediate: true })

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  const body = new FormData()
  for (const f of files) body.append('files', f, f.name)
  uploading.value = true
  try {
    await $fetch(`${props.endpoint}/images`, { method: 'POST', body })
    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`)
    emit('changed')
  }
  catch (error) {
    toast.error('Upload failed', parseApiError(error).message)
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}

async function setCover(img: GalleryImage) {
  busyId.value = img.id
  try {
    await $fetch(`${props.endpoint}/images/${img.id}`, { method: 'PATCH', body: { cover: true } })
    emit('changed')
  }
  catch (error) { toast.error('Could not set cover', parseApiError(error).message) }
  finally { busyId.value = null }
}

async function saveCaption(img: GalleryImage, caption: string) {
  if ((img.caption || '') === caption) return
  try {
    await $fetch(`${props.endpoint}/images/${img.id}`, { method: 'PATCH', body: { caption } })
    img.caption = caption
    toast.success('Caption saved')
  }
  catch (error) { toast.error('Could not save caption', parseApiError(error).message) }
}

async function remove(img: GalleryImage) {
  if (!confirm('Remove this image? This cannot be undone.')) return
  busyId.value = img.id
  try {
    await $fetch(`${props.endpoint}/images/${img.id}`, { method: 'DELETE' })
    emit('changed')
  }
  catch (error) { toast.error('Could not remove image', parseApiError(error).message) }
  finally { busyId.value = null }
}

async function move(index: number, delta: number) {
  const j = index + delta
  if (j < 0 || j >= list.value.length) return
  const next = [...list.value]
  ;[next[index], next[j]] = [next[j]!, next[index]!]
  list.value = next
  try {
    await $fetch(`${props.endpoint}/images/reorder`, { method: 'PATCH', body: { ids: next.map(i => i.id) } })
  }
  catch (error) {
    toast.error('Could not reorder', parseApiError(error).message)
    emit('changed')
  }
}
</script>

<template>
  <div>
    <div v-if="!uploadsEnabled" class="mb-4 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-[#7a5212]">
      <AppIcon name="alert" :size="18" class="mt-0.5 shrink-0" />
      <span>Uploads are disabled until Cloudinary credentials are added (NUXT_CLOUDINARY_* environment variables).</span>
    </div>
    <label v-else :class="['flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-charcoal/15 bg-white px-6 py-8 text-center transition hover:border-wine', uploading ? 'pointer-events-none opacity-60' : '']">
      <AppIcon :name="uploading ? 'spinner' : 'upload'" :size="24" class="text-mocha" />
      <span class="text-sm font-medium">{{ uploading ? 'Uploading…' : 'Upload images' }}</span>
      <span class="text-xs text-ink-muted">JPEG, PNG, WebP or AVIF · up to 15 MB each · select several at once</span>
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple class="sr-only" @change="onFiles">
    </label>

    <ul v-if="list.length" class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      <li v-for="(img, i) in list" :key="img.id" class="overflow-hidden rounded-lg border border-charcoal/10 bg-white">
        <div class="relative aspect-[4/3] bg-rose/20">
          <AppImage :media="img.media" sizes="300px" />
          <span v-if="img.media?.id === coverMediaId" class="absolute left-2 top-2 rounded-full bg-wine px-2 py-0.5 text-[0.65rem] font-medium text-champagne">Cover</span>
          <span v-if="img.media?.isPlaceholder" class="absolute right-2 top-2 rounded-full bg-warning px-2 py-0.5 text-[0.65rem] font-medium text-white">Placeholder</span>
          <div v-if="busyId === img.id" class="absolute inset-0 flex items-center justify-center bg-white/60"><AppIcon name="spinner" :size="22" /></div>
        </div>
        <div class="space-y-2 p-2">
          <input v-if="withCaptions" :value="img.caption || ''" class="admin-input !py-1.5 !text-xs" placeholder="Caption (optional)" aria-label="Caption" @change="saveCaption(img, ($event.target as HTMLInputElement).value)">
          <div class="flex items-center justify-between gap-1">
            <div class="flex gap-1">
              <button type="button" class="admin-btn-secondary !p-1.5" :disabled="i === 0" aria-label="Move earlier" @click="move(i, -1)"><AppIcon name="chevron-left" :size="14" /></button>
              <button type="button" class="admin-btn-secondary !p-1.5" :disabled="i === list.length - 1" aria-label="Move later" @click="move(i, 1)"><AppIcon name="chevron-right" :size="14" /></button>
            </div>
            <div class="flex gap-1">
              <button v-if="img.media?.id !== coverMediaId" type="button" class="admin-btn-secondary !px-2 !py-1.5 text-xs" @click="setCover(img)">Set cover</button>
              <button type="button" class="admin-btn-secondary !p-1.5 hover:!text-danger" aria-label="Remove image" @click="remove(img)"><AppIcon name="trash" :size="14" /></button>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="mt-4 text-sm text-ink-muted">No images yet.</p>
  </div>
</template>
