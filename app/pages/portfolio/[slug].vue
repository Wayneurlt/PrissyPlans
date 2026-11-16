<script setup lang="ts">
import { formatDate } from '#shared/utils/format'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch(() => `/api/portfolio/${slug.value}`, { key: `project-${slug.value}` })
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const project = computed(() => data.value!.project)
const related = computed(() => data.value!.related)
const lightboxIndex = ref<number | null>(null)
const gallery = computed(() => project.value.images.filter(i => i.media).map(i => ({ media: i.media, caption: i.caption })))

const meta = computed(() => [
  { label: 'Event type', value: project.value.category?.name },
  { label: 'Date', value: project.value.eventDate ? formatDate(project.value.eventDate, { month: 'long', year: 'numeric' }) : '' },
  { label: 'Location', value: project.value.location },
  { label: 'Venue', value: project.value.venue },
  { label: 'Guests', value: project.value.guestCount ? `${project.value.guestCount}` : '' },
].filter(m => m.value))

usePageSeo(() => ({
  title: project.value.seoTitle || project.value.title,
  description: project.value.seoDescription || project.value.summary || undefined,
  image: project.value.coverMedia?.url,
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero :eyebrow="project.category?.name || 'Portfolio'" :title="project.title" :intro="project.summary || ''" :media="project.coverMedia" />

    <section class="container-x py-14 sm:py-20 lg:py-24">
      <div class="mx-auto max-w-2xl text-center">
        <dl v-if="meta.length" class="flex flex-wrap justify-center gap-x-10 gap-y-5">
          <div v-for="m in meta" :key="m.label">
            <dt class="eyebrow">{{ m.label }}</dt>
            <dd class="mt-1 text-[0.95rem] text-charcoal">{{ m.value }}</dd>
          </div>
        </dl>
        <div v-if="project.description" class="prose-site mt-10">
          <p v-for="(p, i) in paragraphs(project.description)" :key="i">{{ p }}</p>
        </div>
        <p v-if="project.isSample" class="mt-6 text-xs text-ink-muted">This is a layout sample using temporary stock imagery. It is not a Prissy Plans Events project.</p>
      </div>

      <div v-if="gallery.length" class="mx-auto mt-14 max-w-6xl columns-1 gap-5 sm:columns-2 lg:columns-3 lg:gap-6 [&>*]:mb-5 lg:[&>*]:mb-6">
        <button
          v-for="(img, i) in gallery"
          :key="img.media?.id || i"
          v-reveal="{ delay: (i % 3) * 60 }"
          class="image-zoom block w-full break-inside-avoid overflow-hidden bg-rose/30"
          :aria-label="`Open image ${i + 1} of ${gallery.length}`"
          @click="lightboxIndex = i"
        >
          <AppImage :media="img.media" sizes="100vw sm:50vw lg:33vw" img-class="!h-auto" />
        </button>
      </div>
      <ImageLightbox v-model="lightboxIndex" :images="gallery" />

      <div class="mt-14 text-center">
        <NuxtLink :to="{ path: '/enquire', query: enquiryQueryForCategory(project.category?.slug) }" class="btn-primary">Plan something similar</NuxtLink>
      </div>
    </section>

    <section v-if="related.length" class="bg-blush/60 py-20 sm:py-24">
      <div class="container-x">
        <SectionHeading eyebrow="Related" title="More from the portfolio" align="center" />
        <div class="mx-auto mt-12 max-w-6xl">
          <PortfolioGrid :projects="related" />
        </div>
        <div class="mt-12 text-center">
          <NuxtLink to="/portfolio" class="btn-outline">All projects</NuxtLink>
        </div>
      </div>
    </section>

    <CtaBand headline="Love this look? Let's create yours." button="Start planning" />
  </div>
</template>
