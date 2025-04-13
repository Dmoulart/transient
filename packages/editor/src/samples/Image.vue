<template>
  <img
    :src="src"
    :alt="alt"
    :class="[
      borderRadiusMap[borderRadius],
      borderMap[border],
      shadowMap[shadow],
      sizeMap[size],
      opacityMap[opacity],
      aspectRatioMap[aspectRatio],
    ]"
  />
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    border?: 'none' | 'sm' | 'md' | 'lg'
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    opacity?: 'none' | 'sm' | 'md' | 'lg'
    aspectRatio?: 'none' | 'square' | 'video' | 'wide' | 'portrait'
  }>(),
  {
    src: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.mos.cms.futurecdn.net%2FjTNKUAeoKHeoaCcHkrKsxC.jpg&f=1&nofb=1&ipt=3567819babe534de8b6b9fe69da89ccaf9a1f8865633bcefc35bcb088a08e553',
    borderRadius: 'none',
    border: 'none',
    shadow: 'none',
    size: 'md',
    opacity: 'none',
    aspectRatio: 'none',
  },
)

const borderRadiusMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

const borderMap = {
  none: 'border-0',
  sm: 'border border-gray-200',
  md: 'border-2 border-gray-300',
  lg: 'border-4 border-gray-400',
}

const shadowMap = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
}

const opacityMap = {
  none: 'opacity-100',
  sm: 'opacity-75',
  md: 'opacity-50',
  lg: 'opacity-25',
}

const aspectRatioMap = {
  none: '',
  square: 'aspect-square',
  video: 'aspect-video', // 16:9
  wide: 'aspect-[3/1]',
  portrait: 'aspect-[3/4]',
}
</script>
