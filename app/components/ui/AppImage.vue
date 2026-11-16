<script setup lang="ts">
import { PLACEHOLDER_IMAGES, placeholderSrc, type PlaceholderImage, type PlaceholderKey } from '#shared/config/placeholders'

/**
 * Media-aware responsive image.
 * - Cloudinary uploads → `cloudinary` provider (responsive transforms).
 * - External placeholder (Unsplash) → `unsplash` provider.
 * - Anything else → raw URL.
 * Falls back to a placeholder key when no media is supplied, then to a styled empty surface.
 */
interface MediaLike {
  provider?: 'CLOUDINARY' | 'EXTERNAL' | string
  url: string
  publicId?: string | null
  altText?: string | null
  width?: number | null
  height?: number | null
}

const props = withDefaults(defineProps<{
  media?: MediaLike | null
  placeholder?: PlaceholderKey | PlaceholderImage | null
  alt?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
  imgClass?: string
  fit?: 'cover' | 'contain'
  width?: number
  height?: number
}>(), {
  media: null,
  placeholder: null,
  alt: '',
  sizes: '100vw sm:100vw md:50vw lg:33vw',
  loading: 'lazy',
  fetchpriority: 'auto',
  imgClass: '',
  fit: 'cover',
  width: undefined,
  height: undefined,
})

const config = useRuntimeConfig()
const cloudinaryEnabled = Boolean(config.public.cloudinaryCloudName)

const placeholderImage = computed<PlaceholderImage | null>(() => {
  if (!props.placeholder) return null
  return typeof props.placeholder === 'string' ? PLACEHOLDER_IMAGES[props.placeholder] : props.placeholder
})

const resolved = computed(() => {
  const m = props.media
  if (m?.url) {
    if (m.provider === 'CLOUDINARY' && m.publicId && cloudinaryEnabled) {
      return { provider: 'cloudinary', src: m.publicId, alt: props.alt || m.altText || '' }
    }
    const unsplash = m.url.match(/images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)/)
    if (unsplash) {
      return { provider: 'unsplash', src: `/${unsplash[1]}`, alt: props.alt || m.altText || '' }
    }
    return { provider: 'none', src: m.url, alt: props.alt || m.altText || '' }
  }
  if (placeholderImage.value) {
    return { provider: 'unsplash', src: placeholderSrc(placeholderImage.value), alt: props.alt || placeholderImage.value.alt }
  }
  return null
})

const fitClass = computed(() => (props.fit === 'contain' ? 'object-contain' : 'object-cover'))

/**
 * Nuxt Image treats an unprefixed size token as a 1px "default" screen, which
 * produces junk 0w/1w/2w srcset candidates. Map bare tokens to the smallest
 * breakpoint so callers can still write "100vw md:50vw" or just "30vw".
 */
const normalizedSizes = computed(() =>
  props.sizes.trim().split(/\s+/).map(token => (token.includes(':') ? token : `xs:${token}`)).join(' '),
)
</script>

<template>
  <NuxtImg
    v-if="resolved"
    :provider="(resolved.provider as any)"
    :src="resolved.src"
    :alt="resolved.alt"
    :sizes="normalizedSizes"
    :loading="loading"
    :fetchpriority="fetchpriority"
    :width="width"
    :height="height"
    :modifiers="resolved.provider === 'cloudinary' ? { gravity: 'auto' } : undefined"
    :class="['h-full w-full', fitClass, imgClass]"
    decoding="async"
  />
  <div v-else :class="['h-full w-full bg-rose/40', imgClass]" aria-hidden="true" />
</template>
