<template>
  <div
    :class="[
      directionClass[direction],
      gapMap[gap],
      alignMap[align],
      justifyMap[justify],
      paddingMap[padding],
      borderMap[border],
      backgroundMap[background],
      borderRadiusMap[borderRadius],
      fullWidth ? 'w-full' : '',
      fullHeight ? 'h-full' : '',
    ]"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    direction?: 'row' | 'column' | 'row-wrap'
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    justify?: 'start' | 'center' | 'end' | 'between'
    align?: 'start' | 'center' | 'end' | 'stretch'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    border?: 'none' | 'sm' | 'md' | 'lg'
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    fullWidth?: boolean
    fullHeight?: boolean
    background?: 'none' | 'muted' | 'surface' | 'accent' | 'danger' | 'info' | 'success'
  }>(),
  {
    direction: 'row',
    gap: 'md',
    justify: 'start',
    align: 'center',
    padding: 'none',
    border: 'none',
    borderRadius: 'none',
    fullWidth: false,
    fullHeight: false,
    background: 'none',
  },
)

const directionClass = {
  row: 'flex flex-row',
  column: 'flex flex-col',
  'row-wrap': 'flex flex-row flex-wrap',
}

const gapMap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

const borderMap = {
  none: 'border-0',
  sm: 'border border-gray-200',
  md: 'border-2 border-gray-300',
  lg: 'border-4 border-gray-400',
}

const backgroundMap = {
  none: 'bg-transparent',
  muted: 'bg-gray-100',
  surface: 'bg-white',
  accent: 'bg-gradient-to-r from-pink-100 to-yellow-100',
  danger: 'bg-red-100',
  info: 'bg-blue-100',
  success: 'bg-green-100',
}

const borderRadiusMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}
</script>
