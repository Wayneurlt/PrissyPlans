<script setup lang="ts">
/**
 * Renders only genuine, published testimonials from the database.
 * When there are none, the section is omitted entirely (nothing is fabricated).
 */
const { data: testimonials } = await useFetch('/api/testimonials', { key: 'testimonials', default: () => [] })
const index = ref(0)
const current = computed(() => testimonials.value[index.value])

function go(delta: number) {
  const n = testimonials.value.length
  index.value = (index.value + delta + n) % n
}
</script>

<template>
  <section v-if="testimonials.length && current" class="bg-blush/60 py-20 sm:py-24 lg:py-28">
    <div class="container-x">
      <div class="mx-auto max-w-4xl text-center">
        <p v-reveal class="eyebrow mb-8">Kind words</p>
        <AppIcon name="quote" :size="36" class="mx-auto text-rose-deep" />
        <Transition mode="out-in" enter-active-class="transition duration-500 ease-luxe" enter-from-class="opacity-0 translate-y-3" leave-active-class="transition duration-250" leave-to-class="opacity-0 -translate-y-2">
          <blockquote :key="current.id" class="mt-6">
            <p class="font-serif text-2xl font-light leading-snug text-charcoal sm:text-3xl lg:text-4xl">“{{ current.quote }}”</p>
            <footer class="mt-8 flex flex-col items-center gap-3">
              <div v-if="current.photo" class="h-14 w-14 overflow-hidden rounded-full">
                <AppImage :media="current.photo" :alt="current.clientName" sizes="56px" />
              </div>
              <div>
                <p class="font-label text-[0.7rem] uppercase tracking-[0.26em] text-charcoal">{{ current.clientName }}</p>
                <p v-if="current.eventType" class="mt-1 text-sm text-ink-muted">{{ current.eventType }}</p>
              </div>
              <div v-if="current.rating" class="flex gap-1 text-gold" :aria-label="`${current.rating} out of 5 stars`">
                <AppIcon v-for="n in current.rating" :key="n" name="star" :size="14" class="fill-current" />
              </div>
            </footer>
          </blockquote>
        </Transition>
        <div v-if="testimonials.length > 1" class="mt-10 flex items-center justify-center gap-4">
          <button class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/20 transition hover:border-charcoal" aria-label="Previous testimonial" @click="go(-1)"><AppIcon name="arrow-left" :size="16" /></button>
          <span class="font-label text-[0.66rem] tracking-[0.2em] text-ink-muted">{{ index + 1 }} / {{ testimonials.length }}</span>
          <button class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/20 transition hover:border-charcoal" aria-label="Next testimonial" @click="go(1)"><AppIcon name="arrow-right" :size="16" /></button>
        </div>
      </div>
    </div>
  </section>
</template>
