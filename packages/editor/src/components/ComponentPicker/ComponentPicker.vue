<template>
  <Panel class="tr-fixed tr-top-[10%] tr-right-4">
    <template #header>
      <strong class="tr-title">Ajouter un composant</strong>
    </template>
    <SearchInput ref="searchInput" v-model="search" focus-on-mount />
    <div class="tr-flex tr-flex-col tr-gap-4">
      <component
        :is="folder ? 'details' : 'div'"
        v-for="[ folder, schemas ] in groups"
        :key="folder"
        open
      >
        <summary
          v-if="folder"
          class="tr-flex tr-items-center tr-gap-2 tr-mb-3 tr-cursor-pointer tr-select-none tr-list-none tr-text-meta tr-font-medium tr-uppercase tr-tracking-wide tr-text-ink-muted hover:tr-text-ink [&::-webkit-details-marker]:tr-hidden"
        >
          <span
            class="tr-i-lucide-chevron-right tr-transition-transform [details[open]>summary>&]:tr-rotate-90"
            aria-hidden="true"
          />
          <span class="tr-i-lucide-folder" aria-hidden="true" />
          {{ folder }}
          <span class="tr-ml-auto tr-font-mono tr-normal-case">{{ schemas.length }}</span>
        </summary>
        <div class="tr-card-grid">
          <ComponentItem
            v-for="schema in schemas"
            :key="schema.path"
            :schema="schema"
            @select="(data) => emit('select', data)"
            :dictionnary="dictionnary"
            :component="components[pascalCase(schema.tag)]"
          />
        </div>
      </component>
    </div>
  </Panel>
</template>
<script setup lang="ts">
import { pascalCase } from '@transient/core'
import type { TransientComponentDictionnary, TransientComponentSchema } from '@transient/ir'
import { type Component, computed, ref } from 'vue'
import { useCan } from '@/lib/edition/rules.ts'
import { createComponentFromSchema } from '@/lib/transient/attributes.ts'
import Panel from '../Panel.vue'
import SearchInput from '../SearchInput.vue'
import ComponentItem from './ComponentItem.vue'

const props = defineProps<{
  dictionnary: TransientComponentDictionnary
  components: Record<string, Component>
}>()
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
const can = useCan()

const groups = computed(() => {
  const terms = normalizeSearchTerms(search.value)

  const schemas = Object.entries(props.dictionnary)
    .filter(
      ([name, schema]) =>
        normalizeSearchTerms(name).includes(terms) &&
        // the candidate isn't in the tree yet: only selectors without combinators can match it
        can('add-component', createComponentFromSchema(schema)),
    )
    .map(([_, schema]) => schema)

  const byFolder = Object.groupBy(schemas, ({ path }) => {
    const folder = /.*\/(?<path>[^/]+)\/(?<file>[^/]+)/.exec(path)?.groups?.path ?? ''

    return folder === 'components' ? '' : folder
  })

  return Object.entries(byFolder)
    .map(([folder, list]) => [folder, list ?? []] as const)
    .sort(([a], [b]) => a.localeCompare(b))
})

function normalizeSearchTerms(text: string) {
  return text.trim().toLowerCase()
}
</script>
