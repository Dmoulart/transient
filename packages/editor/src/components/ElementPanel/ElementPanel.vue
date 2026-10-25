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
import PropsFields from './Props/PropsFields.vue'

const props = defineProps<{
  template: TransientTemplate
  schema: TransientComponentSchema
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
  <aside class="tr-panel tr-gap-4 tr-max-h-[80dvh] tr-scroll-root tr-overflow-hidden">
    <header
      class="tr-scroll-shadow tr-p-4 tr-pb-1 tr-bg-surface tr-sticky tr-top-0 tr-z-1 tr-flex tr-flex-row tr-justify-between tr-items-center"
    >
      <div class="tr-flex tr-flex-col tr-gap-2">
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
      </div>
      <button type="button" class="tr-icon-btn" aria-label="Fermer" @click="$emit('close')">
        <span class="tr-i-lucide-x" aria-hidden="true" />
      </button>
    </header>
    <PropsFields
      v-if="Object.keys(schema.props).length > 0"
      class="tr-scroll-body tr-overflow-y-auto tr-p-4"
      :props-schema="schema.props"
      :values="model.attributes"
      @update="(data) => emit('updateProp', data)"
    />
  </aside>
</template>
<style>
.tr-breadcrumb li + li::before {
  content: "/";
  margin-inline-end: var(--tr-space-2);
}
</style>
