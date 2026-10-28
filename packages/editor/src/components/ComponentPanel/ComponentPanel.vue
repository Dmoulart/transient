<template>
  <Panel class="tr-fixed tr-top-[10%] tr-right-4">
    <template #header>
      <strong class="tr-title">Ajouter un composant</strong>
    </template>
    <SearchInput ref="searchInput" v-model="search" focus-on-mount />
    <div class="tr-card-grid">
      <ComponentItem
        v-for="schema in filteredDictionnary"
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
import { computed, ref } from 'vue'
import Panel from '../Panel.vue'
import SearchInput from '../SearchInput.vue'
import ComponentItem from './ComponentItem.vue'

const props = defineProps<{ dictionnary: TransientComponentDictionnary }>()
const emit =
  defineEmits<
    (
      e: 'select',
      data: {
        schema: TransientComponentSchema
      },
    ) => void
  >()

const search = ref('')

const filteredDictionnary = computed(() => {
  const terms = normalizeSearchTerms(search.value)

  if (terms === '') {
    return props.dictionnary
  }

  return Object.fromEntries(
    Object.entries(props.dictionnary).filter(([name]) => {
      return normalizeSearchTerms(name).includes(terms)
    }),
  )
})

function normalizeSearchTerms(text: string) {
  return text.trim().toLowerCase()
}
</script>
