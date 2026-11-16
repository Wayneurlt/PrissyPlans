<script setup lang="ts">
const { isConfigured, link, label } = useWhatsApp()
const visible = ref(false)

onMounted(() => {
  const show = () => { visible.value = window.scrollY > 200 }
  show()
  window.addEventListener('scroll', show, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', show))
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-luxe"
    enter-from-class="opacity-0 translate-y-4"
    leave-active-class="transition duration-300"
    leave-to-class="opacity-0 translate-y-4"
  >
    <a
      v-if="isConfigured && visible"
      :href="link()"
      target="_blank"
      rel="noopener noreferrer"
      class="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-whatsapp pl-4 pr-5 py-3 text-white shadow-[0_18px_40px_-16px_rgb(37_211_102_/_0.7)] transition hover:bg-[#1ebe5b] md:bottom-7 md:right-7"
      :aria-label="label"
    >
      <AppIcon name="whatsapp" :size="22" />
      <span class="font-label text-[0.68rem] uppercase tracking-[0.22em]">{{ label }}</span>
    </a>
  </Transition>
</template>
