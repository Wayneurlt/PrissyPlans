<script setup lang="ts">
import { INSPIRATION_THEMES } from '#shared/config/inspiration'

usePageSeo({
  title: 'Event Inspiration',
  description: 'Explore event styles from classic elegance and modern minimalism to boho chic and vibrant celebrations, then create an event like it with Prissy Plans Events.',
})
</script>

<template>
  <div>
    <PageHero eyebrow="Inspiration" title="Find your style" intro="A starting point for your celebration. Choose a direction you love and we will tailor it to your event, venue and budget." placeholder="heroInspiration" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div class="mx-auto grid max-w-6xl gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="(t, i) in INSPIRATION_THEMES" :id="t.slug" :key="t.slug" v-reveal="{ delay: (i % 3) * 70 }" class="flex scroll-mt-24 flex-col">
          <div class="image-zoom aspect-[4/5] overflow-hidden bg-rose/30">
            <AppImage :placeholder="t.image" :alt="t.name" sizes="100vw sm:50vw lg:33vw" />
          </div>
          <div class="mt-5 flex flex-1 flex-col">
            <div class="flex items-center gap-1.5" aria-label="Suggested palette">
              <span v-for="c in t.palette" :key="c" class="h-4 w-4 rounded-full border border-charcoal/10" :style="{ background: c }" />
            </div>
            <h2 class="mt-4 font-serif text-2xl font-normal text-charcoal">{{ t.name }}</h2>
            <p class="mt-1 font-serif text-lg italic text-mocha">{{ t.tagline }}</p>
            <p class="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink-muted">{{ t.description }}</p>
            <NuxtLink :to="{ path: '/enquire', query: { theme: t.name } }" class="link-underline mt-5 self-start font-label text-[0.7rem] uppercase tracking-[0.22em] text-charcoal">
              Create an event like this
            </NuxtLink>
          </div>
        </article>
      </div>

      <p class="mx-auto mt-16 max-w-2xl text-center text-xs leading-relaxed text-ink-muted">
        These themes are proposed style directions illustrated with stock photography, not completed Prissy Plans Events projects. See the <NuxtLink to="/portfolio" class="underline">portfolio</NuxtLink> for our work.
      </p>
    </section>

    <CtaBand headline="Have a style in mind that isn't here? Let's design it together." />
  </div>
</template>
