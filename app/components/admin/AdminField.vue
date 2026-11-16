<script setup lang="ts">
defineProps<{ label: string, id: string, error?: string, help?: string, optional?: boolean }>()
</script>

<template>
  <div>
    <label :for="id" class="admin-label">
      {{ label }}
      <span v-if="optional" class="font-normal text-charcoal/40">(optional)</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1.5 text-sm text-danger">{{ error }}</p>
    <p v-else-if="help" class="mt-1.5 text-xs text-ink-muted">{{ help }}</p>
  </div>
</template>
