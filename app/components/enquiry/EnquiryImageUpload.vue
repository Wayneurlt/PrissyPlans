<script setup lang="ts">
import { ENQUIRY_UPLOAD } from '#shared/config/enquiry'

interface Uploaded { id: string, url: string }

const props = defineProps<{ modelValue: string[], enabled: boolean, maxFiles: number, maxBytes: number }>()
const emit = defineEmits<{ 'update:modelValue': [ids: string[]] }>()

const toast = useToast()
const input = ref<HTMLInputElement | null>(null)
const uploads = ref<Uploaded[]>([])
const uploading = ref(false)
const localError = ref('')

async function onChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  localError.value = ''

  if (uploads.value.length + files.length > props.maxFiles) {
    localError.value = `You can attach up to ${props.maxFiles} images.`
    return
  }
  for (const f of files) {
    if (f.size > props.maxBytes) {
      localError.value = `"${f.name}" is larger than ${Math.round(props.maxBytes / 1024 / 1024)} MB.`
      return
    }
    if (!ENQUIRY_UPLOAD.allowedMimeTypes.includes(f.type as typeof ENQUIRY_UPLOAD.allowedMimeTypes[number]) && f.type !== '') {
      localError.value = `"${f.name}" is not a supported image type.`
      return
    }
  }

  const body = new FormData()
  for (const f of files) body.append('files', f, f.name)
  uploading.value = true
  try {
    const result = await $fetch<Uploaded[]>('/api/enquiries/upload', { method: 'POST', body })
    uploads.value = [...uploads.value, ...result]
    emit('update:modelValue', uploads.value.map(u => u.id))
  }
  catch (error) {
    const { message } = parseApiError(error)
    localError.value = message
    toast.error('Upload failed', message)
  }
  finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}

function remove(id: string) {
  uploads.value = uploads.value.filter(u => u.id !== id)
  emit('update:modelValue', uploads.value.map(u => u.id))
}
</script>

<template>
  <div>
    <p class="field-label">Inspiration images <span class="normal-case tracking-normal text-charcoal/40">(optional)</span></p>
    <div v-if="!enabled" class="border border-dashed border-charcoal/20 p-4 text-sm text-ink-muted">
      Image uploads are not available right now. You can share inspiration images with us on WhatsApp after submitting.
    </div>
    <template v-else>
      <label
        :class="['flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-charcoal/30 px-6 py-8 text-center transition hover:border-wine', uploading ? 'opacity-60' : '']"
      >
        <AppIcon :name="uploading ? 'spinner' : 'upload'" :size="22" class="text-mocha" />
        <span class="text-sm text-charcoal">{{ uploading ? 'Uploading…' : 'Click to add images' }}</span>
        <span class="text-xs text-ink-muted">JPEG, PNG, WebP or HEIC · up to {{ maxFiles }} images · {{ Math.round(maxBytes / 1024 / 1024) }} MB each</span>
        <input ref="input" type="file" accept="image/*" multiple class="sr-only" :disabled="uploading || uploads.length >= maxFiles" @change="onChange">
      </label>
      <p v-if="localError" class="field-error">{{ localError }}</p>
      <ul v-if="uploads.length" class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        <li v-for="u in uploads" :key="u.id" class="group relative aspect-square overflow-hidden bg-rose/30">
          <img :src="u.url" alt="" class="h-full w-full object-cover">
          <button type="button" class="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/80 text-cream opacity-90 transition hover:bg-danger" aria-label="Remove image" @click="remove(u.id)">
            <AppIcon name="close" :size="14" />
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>
