<script setup lang="ts">
withDefaults(defineProps<{
  headline?: string
  button?: string
}>(), { headline: '', button: '' })

const { get } = useSiteSettings()
const { isConfigured, link, label } = useWhatsApp()
</script>

<template>
  <section class="bg-wine py-20 text-center text-champagne sm:py-24 lg:py-28">
    <div class="container-x">
      <div class="mx-auto max-w-2xl">
        <Ornament light />
        <h2 v-reveal class="text-h2 mt-8 font-serif font-light">{{ headline || get('cta.finalHeadline') }}</h2>
        <div v-reveal="{ delay: 100 }" class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <NuxtLink to="/enquire" class="btn-light w-full sm:w-auto">{{ button || get('cta.finalButton') }}</NuxtLink>
          <a v-if="isConfigured" :href="link()" target="_blank" rel="noopener noreferrer" class="btn-outline-light w-full sm:w-auto">
            <AppIcon name="whatsapp" :size="18" />
            {{ label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
