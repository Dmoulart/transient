<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)

const variantClasses = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-700',
  secondary: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}
</script>
