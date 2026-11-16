/**
 * `v-reveal` adds `is-visible` when an element scrolls into view.
 * Pairs with the `.reveal` utility in main.css. Registered on server and client:
 * the server renders nothing extra, the client observes. Respects
 * prefers-reduced-motion and degrades gracefully without IntersectionObserver.
 *
 * Usage: <div v-reveal> or <div v-reveal="{ delay: 120 }">
 */
import type { Directive } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  if (import.meta.client) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay || 0)
          if (delay) el.style.transitionDelay = `${delay}ms`
          el.classList.add('is-visible')
          observer?.unobserve(el)
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    }
  }

  const reveal: Directive<HTMLElement, { delay?: number } | undefined> = {
    mounted(el, binding) {
      if (!observer) return
      // Only hide elements that are below the fold, so content never flashes away.
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92) return
      el.classList.add('reveal')
      if (binding.value?.delay) el.dataset.revealDelay = String(binding.value.delay)
      observer.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
    getSSRProps() {
      return {}
    },
  }

  nuxtApp.vueApp.directive('reveal', reveal)
})
