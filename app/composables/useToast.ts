export interface ToastItem {
  id: number
  title: string
  message?: string
  tone: 'success' | 'error' | 'info'
  timeout: number
}

let counter = 0

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  function push(toast: Omit<ToastItem, 'id' | 'timeout'> & { timeout?: number }) {
    const item: ToastItem = { id: ++counter, timeout: 4500, ...toast }
    toasts.value = [...toasts.value, item]
    if (import.meta.client && item.timeout > 0) {
      setTimeout(() => dismiss(item.id), item.timeout)
    }
    return item.id
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (title: string, message?: string) => push({ title, message, tone: 'success' }),
    error: (title: string, message?: string) => push({ title, message, tone: 'error', timeout: 7000 }),
    info: (title: string, message?: string) => push({ title, message, tone: 'info' }),
  }
}

/** Extracts a human-readable message (and field errors) from a $fetch error. */
export function parseApiError(error: unknown): { message: string, fieldErrors: Record<string, string> } {
  const err = error as { data?: { data?: { fieldErrors?: Record<string, string>, message?: string }, statusMessage?: string, message?: string }, statusMessage?: string, message?: string }
  const data = err?.data?.data
  const fieldErrors = data?.fieldErrors ?? {}
  const message = data?.message
    || (Object.keys(fieldErrors).length ? 'Please check the highlighted fields.' : '')
    || err?.data?.statusMessage
    || err?.statusMessage
    || err?.message
    || 'Something went wrong. Please try again.'
  return { message, fieldErrors }
}
