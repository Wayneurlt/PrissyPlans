<script setup lang="ts">
withDefaults(defineProps<{ icon?: string, title: string, text?: string }>(), { icon: 'inbox', text: '' })
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center">
    <AppIcon :name="icon" :size="28" class="text-mocha" />
    <p class="mt-4 font-serif text-2xl text-charcoal">{{ title }}</p>
    <p v-if="text" class="mt-1 max-w-md text-sm text-ink-muted">{{ text }}</p>
    <div class="mt-5"><slot /></div>
  </div>
</template>
