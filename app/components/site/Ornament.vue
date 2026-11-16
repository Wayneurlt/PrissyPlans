<script setup lang="ts">
/** Small flourish divider echoing the logo's ornament. */
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>

<template>
  <div :class="['flex items-center justify-center gap-4', light ? 'text-champagne/50' : 'text-mocha/60']" aria-hidden="true">
    <span class="h-px w-12 bg-current" />
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0l1.6 5.4L14 7l-5.4 1.6L7 14l-1.6-5.4L0 7l5.4-1.6z" /></svg>
    <span class="h-px w-12 bg-current" />
  </div>
</template>
