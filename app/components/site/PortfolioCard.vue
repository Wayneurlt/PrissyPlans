<script setup lang="ts">
import type { ProjectDTO } from '#shared/types/public'

withDefaults(defineProps<{
  project: ProjectDTO
  sizes?: string
}>(), { sizes: '100vw sm:50vw lg:33vw' })
</script>

<template>
  <NuxtLink :to="`/portfolio/${project.slug}`" class="group block">
    <div class="image-zoom aspect-[4/5] overflow-hidden bg-rose/30">
      <AppImage :media="project.coverMedia" :alt="project.title" :sizes="sizes" />
    </div>
    <div class="mt-4">
      <p v-if="project.category" class="eyebrow">{{ project.category.name }}</p>
      <h3 class="mt-1.5 font-serif text-[1.45rem] font-normal leading-snug text-charcoal transition-colors group-hover:text-wine">{{ project.title }}</h3>
      <p v-if="project.isSample" class="mt-1 text-xs text-ink-muted">Sample · placeholder imagery</p>
    </div>
  </NuxtLink>
</template>
