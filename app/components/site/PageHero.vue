<script setup lang="ts">
import type { PlaceholderKey } from '#shared/config/placeholders'

withDefaults(defineProps<{
  eyebrow?: string
  title: string
  intro?: string
  placeholder?: PlaceholderKey
  media?: { provider?: string, url: string, publicId?: string | null, altText?: string | null } | null
}>(), {
  eyebrow: '',
  intro: '',
  placeholder: 'heroServices',
  media: null,
})
</script>

<template>
  <section class="relative isolate flex min-h-[320px] items-center overflow-hidden bg-wine text-center text-champagne sm:min-h-[380px] lg:min-h-[440px]">
    <div class="absolute inset-0 -z-10">
      <AppImage :media="media" :placeholder="placeholder" sizes="100vw" loading="eager" fetchpriority="high" />
      <div class="absolute inset-0 bg-wine/65" />
    </div>
    <div class="container-x py-16 sm:py-20">
      <div class="mx-auto max-w-3xl">
        <p v-if="eyebrow" class="eyebrow-light mb-4">{{ eyebrow }}</p>
        <h1 class="text-h1 font-serif font-light">{{ title }}</h1>
        <p v-if="intro" class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-champagne/85 sm:text-lg">{{ intro }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>
