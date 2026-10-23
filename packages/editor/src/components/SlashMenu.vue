<template>
  <ul
    :groups="[{ id: 'components', items }]"
    placeholder="Insérer un composant…"
    class="max-h-80 rounded-md border bg-default shadow"
    @keydown.esc="emit('close')"
  >
  <li v-for="({id,label}) in items" :key="id" @mousedown="emit('insert', '')">{{ label }}</li>
</ul>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useDictionnary } from '@/lib/composables/use-dictionnary'

const emit = defineEmits<{ close: []; insert: [string] }>()
const dictionnary = useDictionnary()

const items = computed(() => {
  return Object.entries(dictionnary.all()).map(([name]) => ({
    id: name,
    label: name,
  }))
})
</script>
