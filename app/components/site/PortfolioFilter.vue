<script setup lang="ts">
interface Category { slug: string, name: string, projectCount?: number }

const props = defineProps<{ categories: Category[], modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = computed(() => [
  { slug: 'all', name: 'All' },
  ...props.categories.filter(c => (c.projectCount ?? 1) > 0).map(c => ({ slug: c.slug, name: c.name })),
])

function select(slug: string) {
  emit('update:modelValue', slug)
}
</script>

<template>
  <div>
    <!-- Phones: one compact dropdown -->
    <div class="relative mx-auto max-w-xs sm:hidden">
      <label for="portfolio-filter" class="sr-only">Filter by event type</label>
      <select
        id="portfolio-filter"
        :value="modelValue"
        class="w-full appearance-none border border-charcoal/20 bg-white px-4 py-3 pr-10 font-label text-[0.72rem] uppercase tracking-[0.2em] text-charcoal focus:border-wine focus:outline-none"
        @change="select(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in options" :key="opt.slug" :value="opt.slug">{{ opt.slug === 'all' ? 'All events' : opt.name }}</option>
      </select>
      <AppIcon name="chevron-down" :size="16" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mocha" />
    </div>

    <!-- Tablets and up: quiet text tabs -->
    <div class="hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:flex" role="tablist" aria-label="Filter portfolio by event type">
      <button
        v-for="opt in options"
        :key="opt.slug"
        type="button"
        role="tab"
        :aria-selected="modelValue === opt.slug"
        :class="[
          'relative py-1.5 font-label text-[0.72rem] uppercase tracking-[0.2em] transition-colors',
          modelValue === opt.slug ? 'text-wine' : 'text-charcoal/55 hover:text-charcoal',
        ]"
        @click="select(opt.slug)"
      >
        {{ opt.name }}
        <span :class="['absolute inset-x-0 bottom-0 h-px bg-wine transition-transform duration-300', modelValue === opt.slug ? 'scale-x-100' : 'scale-x-0']" />
      </button>
    </div>
  </div>
</template>
