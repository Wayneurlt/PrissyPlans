<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string | null
  href?: string | null
  variant?: 'primary' | 'light' | 'outline' | 'outline-light' | 'whatsapp' | 'ghost'
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  icon?: string | null
  iconPosition?: 'left' | 'right'
  external?: boolean
}>(), {
  to: null,
  href: null,
  variant: 'primary',
  type: 'button',
  loading: false,
  disabled: false,
  icon: null,
  iconPosition: 'right',
  external: false,
})

const classes = computed(() => ({
  'primary': 'btn-primary',
  'light': 'btn-light',
  'outline': 'btn-outline',
  'outline-light': 'btn-outline-light',
  'whatsapp': 'btn-whatsapp',
  'ghost': 'btn-ghost',
}[props.variant]))

const iconName = computed(() => (props.loading ? 'spinner' : props.icon))
</script>

<template>
  <NuxtLink v-if="to && !disabled" :to="to" :class="classes">
    <AppIcon v-if="iconName && iconPosition === 'left'" :name="iconName" :size="16" />
    <span><slot /></span>
    <AppIcon v-if="iconName && iconPosition === 'right'" :name="iconName" :size="16" class="transition-transform duration-300 group-hover:translate-x-0.5" />
  </NuxtLink>
  <a
    v-else-if="href && !disabled"
    :href="href"
    :class="classes"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <AppIcon v-if="iconName && iconPosition === 'left'" :name="iconName" :size="16" />
    <span><slot /></span>
    <AppIcon v-if="iconName && iconPosition === 'right'" :name="iconName" :size="16" />
  </a>
  <button v-else :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading || undefined">
    <AppIcon v-if="iconName && iconPosition === 'left'" :name="iconName" :size="16" />
    <span><slot /></span>
    <AppIcon v-if="iconName && iconPosition === 'right'" :name="iconName" :size="16" />
  </button>
</template>
