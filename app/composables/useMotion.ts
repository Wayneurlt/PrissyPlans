/** Whether the visitor prefers reduced motion (client only; defaults to false during SSR). */
export function usePrefersReducedMotion() {
  const reduced = ref(false)
  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const handler = (e: MediaQueryListEvent) => { reduced.value = e.matches }
    mq.addEventListener('change', handler)
    onBeforeUnmount(() => mq.removeEventListener('change', handler))
  })
  return reduced
}
