<template>
  <ul
    :groups="[{ id: 'components', items }]"
    placeholder="Insérer un composant…"
    class="max-h-80 rounded-md border bg-default shadow"
    @keydown.esc="emit('close')"
  >
    <li v-for="({ id, label }) in items" :key="id" @mousedown="emit('insert', '')">{{ label }}</li>
  </ul>
</template>
<script setup lang="ts">
import type { TransientComponentDictionnary } from '@transient/ir'
import { computed } from 'vue'

const { dictionnary } = defineProps<{ dictionnary: TransientComponentDictionnary }>()
const emit = defineEmits<{ close: []; insert: [string] }>()

const items = computed(() => {
  return Object.entries(dictionnary).map(([name]) => ({
    id: name,
    label: name,
  }))
})
</script>
