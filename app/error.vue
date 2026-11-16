<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { get } = useSiteSettings()
await callOnce('site-settings', loadSiteSettings).catch(() => {})

const is404 = computed(() => props.error?.statusCode === 404)
useHead({ title: is404.value ? 'Page not found' : 'Something went wrong' })

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-wine text-champagne flex flex-col">
    <header class="container-x py-8">
      <NuxtLink to="/" @click.prevent="goHome">
        <AppLogo variant="cream" class="h-14 w-auto" />
      </NuxtLink>
    </header>
    <main class="container-x flex-1 flex flex-col justify-center py-16 relative grain">
      <p class="eyebrow-light mb-6">{{ is404 ? 'Error 404' : `Error ${error?.statusCode || 500}` }}</p>
      <h1 class="text-h1 font-serif max-w-3xl">
        {{ is404 ? 'This page seems to have wandered off.' : 'Something went wrong on our side.' }}
      </h1>
      <p class="mt-6 max-w-xl text-champagne/75 text-lg">
        {{ is404 ? 'The page you are looking for does not exist or has moved. Let us guide you back.' : 'Please try again in a moment. If the problem continues, reach us on WhatsApp and we will help right away.' }}
      </p>
      <div class="mt-10 flex flex-wrap gap-4">
        <button class="btn-light" @click="goHome">Back to home</button>
        <NuxtLink to="/enquire" class="btn-outline-light" @click.prevent="clearError({ redirect: '/enquire' })">Plan your event</NuxtLink>
      </div>
      <p v-if="get('contact.email') && !get('contact.email').startsWith('[')" class="mt-10 text-sm text-champagne/60">
        Email: {{ get('contact.email') }}
      </p>
    </main>
  </div>
</template>
