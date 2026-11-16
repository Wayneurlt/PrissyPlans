<script setup lang="ts">
const { get } = useSiteSettings()
const { isConfigured, link, label } = useWhatsApp()

/** Split the headline into sentences so each sits on its own line. */
const lines = computed(() => get('hero.headline').split(/(?<=[.!?])\s+/).filter(Boolean))
</script>

<template>
  <section
    class="hero-intro relative isolate flex h-[calc(100svh-4rem)] min-h-[520px] max-h-[860px] items-center justify-center overflow-hidden bg-wine text-center text-champagne lg:h-[calc(100svh-5rem)]"
  >
    <div class="absolute inset-0 -z-10">
      <AppImage placeholder="heroHome" sizes="100vw" loading="eager" fetchpriority="high" />
      <div class="absolute inset-0 bg-wine/60" />
      <div class="absolute inset-0 bg-gradient-to-t from-wine/70 via-transparent to-wine/30" />
    </div>

    <div class="container-x">
      <div class="mx-auto max-w-3xl">
        <p class="eyebrow-light mb-6" data-hero>Events Planner · Kenya</p>
        <h1 class="text-display font-serif font-light" data-hero>
          <span v-for="(line, i) in lines" :key="i" :class="['block', i === 1 ? 'italic text-rose' : '']">{{ line }}</span>
        </h1>
        <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-champagne/85 sm:text-lg" data-hero>{{ get('hero.subheadline') }}</p>
        <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" data-hero>
          <NuxtLink to="/enquire" class="btn-light w-full sm:w-auto">{{ get('hero.primaryCta', 'Plan Your Event') }}</NuxtLink>
          <NuxtLink to="/portfolio" class="btn-outline-light w-full sm:w-auto">{{ get('hero.secondaryCta', 'Explore Our Work') }}</NuxtLink>
        </div>
        <a v-if="isConfigured" :href="link()" target="_blank" rel="noopener noreferrer" class="mt-6 inline-flex items-center gap-2 text-sm text-champagne/80 transition hover:text-white" data-hero>
          <AppIcon name="whatsapp" :size="16" class="text-whatsapp" /> {{ label }}
        </a>
      </div>
    </div>
  </section>
</template>
