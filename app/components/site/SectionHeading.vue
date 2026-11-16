<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  text?: string
  align?: 'left' | 'center'
  light?: boolean
  as?: 'h1' | 'h2' | 'h3'
}>(), { eyebrow: '', text: '', align: 'left', light: false, as: 'h2' })
</script>

<template>
  <div :class="[align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl']">
    <p v-if="eyebrow" v-reveal :class="[light ? 'eyebrow-light' : 'eyebrow', 'mb-4']">{{ eyebrow }}</p>
    <component :is="as" v-reveal="{ delay: 60 }" :class="['text-h2 font-serif font-light', light ? 'text-champagne' : 'text-charcoal']">{{ title }}</component>
    <p v-if="text" v-reveal="{ delay: 120 }" :class="['mt-5 text-lg leading-relaxed', light ? 'text-champagne/75' : 'text-ink-muted']">{{ text }}</p>
    <slot />
  </div>
</template>
