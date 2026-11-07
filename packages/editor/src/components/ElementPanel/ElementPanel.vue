<script setup lang="ts">
import {
  type BindingValue,
  getAncestorsChain,
  type TransientComponentSchema,
  type TransientElement,
  type TransientProp,
  type TransientTemplate,
} from '@transient/ir'
import { onKeyStroke } from '@vueuse/core'
import { computed } from 'vue'
import type { FieldRules } from '@/lib/fields.ts'
import Panel from '../Panel.vue'
import PropsFields from './Props/PropsFields.vue'

const props = defineProps<{
  template: TransientTemplate
  schema: TransientComponentSchema
  fields?: FieldRules
}>()

const model = defineModel<TransientElement>({ required: true })

const parents = computed<ReturnType<typeof getAncestorsChain>>(() => {
  return getAncestorsChain(model.value.id, props.template.elements).filter(
    ({ element }) => element.isComponent,
  )
})

const emit = defineEmits<{
  close: []
  updateProp: [data: { prop: TransientProp; propName: string; value: BindingValue }]
}>()

onKeyStroke('Escape', () => emit('close'))
</script>
<template>
  <Panel @close="emit('close')">
    <template #header>
      <nav aria-label="Breadcrumb" v-if="parents.length > 0">
        <ol class="tr-breadcrumb tr-flex tr-flex-row tr-gap-2 tr-flex-wrap">
          <li
            class="tr-font-mono tr-text-meta tr-text-ink-muted"
            v-for="(parent, index) in parents"
            :key="parent.element.id"
            :aria-current="index === parents.length - 1 ? 'page' : undefined"
          >
            {{ parent.element.tag }}
          </li>
        </ol>
      </nav>
      <strong class="tr-title">{{ schema.tag }}</strong>
    </template>
    <PropsFields
      v-if="Object.keys(schema.props).length > 0"
      :schema="schema"
      :values="model.attributes"
      @update="(data) => emit('updateProp', data)"
      :fields="fields"
    />
  </Panel>
</template>
<style>
.tr-breadcrumb li + li::before {
  content: "/";
  margin-inline-end: var(--tr-space-2);
}
</style>
