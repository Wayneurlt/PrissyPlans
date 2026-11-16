<script setup lang="ts">
import { ENQUIRY_STATUSES } from '#shared/config/enquiry'

const props = defineProps<{ status: string }>()

const toneClasses: Record<string, string> = {
  wine: 'bg-wine/10 text-wine',
  mocha: 'bg-mocha/15 text-mocha-deep',
  gold: 'bg-gold/20 text-[#7a5d22]',
  success: 'bg-success/12 text-success',
  charcoal: 'bg-charcoal/10 text-charcoal',
  danger: 'bg-danger/10 text-danger',
}

const def = computed(() => ENQUIRY_STATUSES.find(s => s.key === props.status))
</script>

<template>
  <span :class="['inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[def?.tone || 'charcoal']]">
    {{ def?.label || status }}
  </span>
</template>
