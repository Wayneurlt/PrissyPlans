<script setup lang="ts">
/**
 * Brand logo from the supplied Prissy Plans Events artwork.
 * - form "full": ornamented lockup (footer, login, error page)
 * - form "wordmark": name + "Events Planner" only, readable at header sizes
 */
const props = withDefaults(defineProps<{
  variant?: 'cream' | 'wine' | 'charcoal'
  form?: 'full' | 'wordmark'
}>(), { variant: 'cream', form: 'full' })

const src = computed(() => props.form === 'wordmark'
  ? `/brand/wordmark-${props.variant === 'charcoal' ? 'wine' : props.variant}.svg`
  : `/brand/logo-${props.variant}.svg`)
const dims = computed(() => (props.form === 'wordmark' ? { width: 1061, height: 252 } : { width: 1097, height: 630 }))
</script>

<template>
  <img
    :src="src"
    alt="Prissy Plans Events — Events Planner"
    :width="dims.width"
    :height="dims.height"
    decoding="async"
    v-bind="$attrs"
  >
</template>
