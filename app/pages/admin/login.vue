<script setup lang="ts">
import { loginSchema } from '#shared/schemas/admin'

definePageMeta({ layout: 'blank' })
useHead({ title: 'Admin sign in', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { loggedIn, fetch: refreshSession } = useUserSession()
const form = reactive({ email: '', password: '' })
const errors = ref<Record<string, string>>({})
const formError = ref('')
const loading = ref(false)
const showPassword = ref(false)

const redirectTo = computed(() => {
  const r = String(route.query.redirect || '/admin')
  return r.startsWith('/admin') && !r.startsWith('/admin/login') ? r : '/admin'
})

if (loggedIn.value) await navigateTo(redirectTo.value)

async function submit() {
  errors.value = {}
  formError.value = ''
  const parsed = loginSchema.safeParse(form)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.value[String(issue.path[0])] = issue.message
    return
  }
  loading.value = true
  try {
    await $fetch('/api/admin/auth/login', { method: 'POST', body: parsed.data })
    await refreshSession()
    await navigateTo(redirectTo.value)
  }
  catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    formError.value = status === 429 ? 'Too many attempts. Please wait a few minutes and try again.' : parseApiError(error).message
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-dvh lg:h-dvh lg:grid-cols-2">
    <div class="relative hidden overflow-hidden bg-wine lg:block grain">
      <AppImage placeholder="heroAbout" sizes="50vw" class="absolute inset-0" img-class="opacity-40" />
      <div class="absolute inset-0 flex flex-col justify-between p-12 text-champagne">
        <AppLogo variant="cream" class="h-20 w-auto self-start" />
        <p class="max-w-sm font-serif text-3xl font-light">Every detail, beautifully managed.</p>
      </div>
    </div>
    <main class="flex bg-cream px-6 py-8 sm:py-16 lg:overflow-y-auto">
      <div class="m-auto w-full max-w-sm">
        <AppLogo variant="wine" class="mb-6 h-14 w-auto sm:mb-10 sm:h-16 lg:hidden" />
        <p class="eyebrow mb-3">Studio dashboard</p>
        <h1 class="font-serif text-4xl font-light text-charcoal">Sign in</h1>
        <p class="mt-2 text-sm text-ink-muted">For Prissy Plans Events administrators only.</p>

        <form novalidate class="mt-8 space-y-5 sm:mt-10" @submit.prevent="submit">
          <div v-if="formError" class="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger" role="alert">
            <AppIcon name="alert" :size="16" class="mt-0.5 shrink-0" /> {{ formError }}
          </div>
          <AdminField id="email" label="Email" :error="errors.email">
            <input id="email" v-model="form.email" type="email" autocomplete="username" class="admin-input" :aria-invalid="Boolean(errors.email)">
          </AdminField>
          <AdminField id="password" label="Password" :error="errors.password">
            <div class="relative">
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" class="admin-input pr-11" :aria-invalid="Boolean(errors.password)">
              <button type="button" class="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-charcoal" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
              </button>
            </div>
          </AdminField>
          <button type="submit" class="admin-btn-primary w-full !py-3" :disabled="loading">
            <AppIcon v-if="loading" name="spinner" :size="16" /> Sign in
          </button>
        </form>
        <NuxtLink to="/" class="mt-10 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-charcoal"><AppIcon name="arrow-left" :size="14" /> Back to website</NuxtLink>
      </div>
    </main>
  </div>
</template>
