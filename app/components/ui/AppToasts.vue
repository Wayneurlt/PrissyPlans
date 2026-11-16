<script setup lang="ts">
const { toasts, dismiss } = useToast()

const tones = {
  success: 'border-success/30 bg-white text-charcoal',
  error: 'border-danger/30 bg-white text-charcoal',
  info: 'border-charcoal/15 bg-white text-charcoal',
}
const icons = { success: 'check', error: 'alert', info: 'info' }
const iconTones = { success: 'text-success', error: 'text-danger', info: 'text-mocha' }
</script>

<template>
  <ClientOnly>
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6" aria-live="polite">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-soft', tones[toast.tone]]"
          role="status"
        >
          <AppIcon :name="icons[toast.tone]" :size="18" :class="['mt-0.5 shrink-0', iconTones[toast.tone]]" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">{{ toast.title }}</p>
            <p v-if="toast.message" class="mt-0.5 text-sm text-ink-muted">{{ toast.message }}</p>
          </div>
          <button class="shrink-0 text-charcoal/50 hover:text-charcoal" aria-label="Dismiss" @click="dismiss(toast.id)">
            <AppIcon name="close" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </ClientOnly>
</template>
