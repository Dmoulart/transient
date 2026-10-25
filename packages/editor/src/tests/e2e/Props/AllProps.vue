<!-- one prop per kind the analyzer produces, to exercise PropsFields (ui.html?comp=AllProps) -->
<template>
  <pre class="rounded-md border border-white/20 p-3 font-mono text-xs">{{ $props }}</pre>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    // string
    text?: string
    withDefault?: string
    requiredText: string
    // boolean
    enabled?: boolean
    // decimal (number is never integer)
    count?: number
    // enum, ≤ 4 options → toggle group
    align?: 'left' | 'center' | 'right'
    // enum, > 4 options → select
    weight?: 'thin' | 'light' | 'regular' | 'medium' | 'bold'
    // numeric literals → enum of strings
    level?: 1 | 2 | 3
    // union of an enum and a decimal → raw expression
    width?: 'auto' | number
    // object
    position?: { x: number; y: number }
    // list of primitives
    tags?: string[]
    // list of objects
    links?: { label: string; href: string }[]
    // record
    attrs?: Record<string, string>
    // unknown
    formatter?: (value: string) => string
    date?: Date
  }>(),
  {
    withDefault: 'Hello',
    enabled: true,
    count: 3,
    align: 'center',
    weight: 'regular',
    level: 2,
    width: 'auto',
  },
)
</script>
