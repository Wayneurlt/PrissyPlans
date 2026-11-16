<script setup lang="ts">
import type { ServiceDTO } from '#shared/types/public'

withDefaults(defineProps<{
  service: ServiceDTO
  sizes?: string
}>(), { sizes: '100vw sm:50vw lg:33vw' })
</script>

<template>
  <NuxtLink :to="`/services/${service.slug}`" class="group block">
    <div class="image-zoom aspect-[4/5] overflow-hidden bg-rose/30">
      <AppImage :media="service.coverMedia" :alt="service.name" :sizes="sizes" />
    </div>
    <div class="mt-5 text-center">
      <h3 class="font-serif text-2xl font-normal text-charcoal transition-colors group-hover:text-wine">{{ service.name }}</h3>
      <p class="mx-auto mt-2 max-w-xs text-[0.95rem] leading-relaxed text-ink-muted">{{ service.tagline || service.summary }}</p>
    </div>
  </NuxtLink>
</template>
