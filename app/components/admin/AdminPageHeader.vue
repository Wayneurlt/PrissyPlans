<script setup lang="ts">
defineProps<{ title: string, description?: string, back?: string }>()
</script>

<template>
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <NuxtLink v-if="back" :to="back" class="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-charcoal">
        <AppIcon name="arrow-left" :size="14" /> Back
      </NuxtLink>
      <h1 class="font-serif text-4xl font-medium text-charcoal">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-ink-muted">{{ description }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
