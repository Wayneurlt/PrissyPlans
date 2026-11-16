<script setup lang="ts">
interface LightboxImage {
  media: { provider?: string, url: string, publicId?: string | null, altText?: string | null } | null
  caption?: string | null
}

const props = defineProps<{ images: LightboxImage[], modelValue: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const open = computed(() => props.modelValue !== null && props.modelValue >= 0)
const current = computed(() => (props.modelValue !== null ? props.images[props.modelValue] : undefined))
const dialog = ref<HTMLElement | null>(null)

function close() { emit('update:modelValue', null) }
function go(delta: number) {
  if (props.modelValue === null || !props.images.length) return
  const n = props.images.length
  emit('update:modelValue', (props.modelValue + delta + n) % n)
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}

let touchX = 0
function onTouchStart(e: TouchEvent) { touchX = e.touches[0]?.clientX ?? 0 }
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) nextTick(() => dialog.value?.focus())
})
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (import.meta.client) document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
      <div
        v-if="open && current"
        ref="dialog"
        class="fixed inset-0 z-[90] flex flex-col bg-charcoal/95 text-cream outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabindex="-1"
        @click.self="close"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div class="flex items-center justify-between px-5 py-4">
          <span class="font-label text-[0.66rem] tracking-[0.2em] text-cream/70">{{ (modelValue ?? 0) + 1 }} / {{ images.length }}</span>
          <button class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 transition hover:bg-cream hover:text-charcoal" aria-label="Close" @click="close">
            <AppIcon name="close" :size="20" />
          </button>
        </div>
        <div class="relative flex flex-1 items-center justify-center px-4 pb-6 md:px-20" @click.self="close">
          <button v-if="images.length > 1" class="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 transition hover:bg-cream hover:text-charcoal md:inline-flex" aria-label="Previous image" @click="go(-1)">
            <AppIcon name="chevron-left" :size="20" />
          </button>
          <figure :key="modelValue ?? 0" class="flex max-h-full max-w-6xl flex-col items-center">
            <div class="max-h-[78vh] overflow-hidden">
              <AppImage :media="current.media" sizes="100vw" fit="contain" loading="eager" img-class="max-h-[78vh] w-auto" />
            </div>
            <figcaption v-if="current.caption" class="mt-4 text-center text-sm text-cream/70">{{ current.caption }}</figcaption>
          </figure>
          <button v-if="images.length > 1" class="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 transition hover:bg-cream hover:text-charcoal md:inline-flex" aria-label="Next image" @click="go(1)">
            <AppIcon name="chevron-right" :size="20" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
