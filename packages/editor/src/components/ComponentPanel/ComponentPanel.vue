<template>
  <Panel class="tr-fixed tr-top-[10%] tr-right-4">
    <template #header>
      <strong class="tr-title">Ajouter un composant</strong>
    </template>
    <div class="tr-card-grid">
      <ComponentItem
        v-for="schema in dictionnary"
        :key="schema.path"
        :schema="schema"
        @select="(data) => emit('select', data)"
        :dictionnary="dictionnary"
      />
    </div>
  </Panel>
</template>
<script setup lang="ts">
import type { TransientComponentDictionnary, TransientComponentSchema } from '@transient/ir'
import Panel from '../Panel.vue'
import ComponentItem from './ComponentItem.vue'

defineProps<{ dictionnary: TransientComponentDictionnary }>()
const emit =
  defineEmits<
    (
      e: 'select',
      data: {
        schema: TransientComponentSchema
      },
    ) => void
  >()
</script>
