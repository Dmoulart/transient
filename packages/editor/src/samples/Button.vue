<template>
  <button
    :class="[
      baseStyle,
      variantClasses[variant],
      sizeClasses[size],
      'transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2',
    ]"
    :disabled="disabled"
  >
    <!-- Left Slot -->
    <span v-if="$slots.left" class="flex items-center">
      <slot name="left" />
    </span>

    <!-- Default Slot -->
    <span>
      <slot />
    </span>

    <!-- Right Slot -->
    <span v-if="$slots.right" class="flex items-center">
      <slot name="right" />
    </span>
  </button>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
)

const baseStyle =
  'font-bold rounded-2xl shadow-md text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses = {
  primary:
    'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600',
  secondary:
    'bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-700',
  danger: 'bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500',
  success: 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700',
  warning:
    'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black',
  info: 'bg-gradient-to-r from-sky-400 to-cyan-600 hover:from-sky-500 hover:to-cyan-700',
  neutral: 'bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700',
}

const sizeClasses = {
  xs: 'text-xs px-3 py-1.5',
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
  xl: 'text-xl px-10 py-5',
}
</script>
