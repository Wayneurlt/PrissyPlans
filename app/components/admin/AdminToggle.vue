<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
defineProps<{ label: string, description?: string }>()
</script>

<template>
  <label class="flex cursor-pointer items-start gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :class="['relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition', model ? 'bg-wine' : 'bg-charcoal/20']"
      @click="model = !model"
    >
      <span :class="['absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', model ? 'left-[22px]' : 'left-0.5']" />
    </button>
    <span>
      <span class="block text-sm font-medium text-charcoal">{{ label }}</span>
      <span v-if="description" class="block text-xs text-ink-muted">{{ description }}</span>
    </span>
  </label>
</template>
