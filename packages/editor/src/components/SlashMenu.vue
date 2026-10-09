<template>
  <UCommandPalette
    :groups="[{ id: 'components', items }]"
    placeholder="Insérer un composant…"
    class="max-h-80 rounded-md border bg-default shadow"
    @update:model-value="emit('insert', '')"
    @keydown.esc="emit('close')"
  />
</template>
<script setup lang="ts">
import { useDictionnary } from '@/lib/composables/use-dictionnary'
import { computed } from 'vue'
const emit = defineEmits<{ close: []; insert: [string] }>()
const dictionnary = useDictionnary()

const items = computed(() => {
  return Object.entries(dictionnary.all()).map(([name]) => ({
    id: name,
    label: name,
  }))
})
</script>
