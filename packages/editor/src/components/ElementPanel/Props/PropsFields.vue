<script setup lang="ts">
import {
  type BindingValue,
  getTypeKind,
  type TransientComponentSchema,
  type TransientElementAttributes,
  type TransientProp,
} from '@transient/ir'
import { type Component, useId } from 'vue'
import type { FieldRules } from '@/lib/fields.ts'
import PropField from './PropField.vue'

const props = defineProps<{
  schema: TransientComponentSchema
  values: TransientElementAttributes
  fields?: FieldRules
}>()

const emit = defineEmits<{
  update: [data: { prop: TransientProp; propName: string; value: BindingValue }]
}>()

const id = useId()

function getValue(propName: string) {
  return props.values[propName]
}

function getCustomFieldComponent(propName: string): Component | null {
  for (const field of props.fields ?? []) {
    if (field.component === props.schema.tag && field.prop === propName) {
      return field.use
    }
  }
  return null
}
</script>

<template>
  <div
    v-for="(prop, propName) of schema.props"
    :key="propName"
    class="tr-prop-row"
    data-test="prop"
    data-edition="update-prop"
    :data-prop="propName"
  >
    <div class="tr-prop-head">
      <label class="tr-prop-name" :for="`${id}-${propName}`">
        {{ propName }}
        <template v-if="prop.required">
          <span class="tr-text-danger" aria-hidden="true">*</span>
          <span class="tr-sr-only">(requis)</span>
        </template>
      </label>
      <span class="tr-prop-type">{{ getTypeKind(prop.type) }}</span>
    </div>
    <component
      :is="getCustomFieldComponent(propName) || PropField"
      :id="`${id}-${propName}`"
      :prop="prop"
      :model-value="getValue(propName)?.expression"
      @update:model-value="(value:BindingValue) => emit('update', { prop, propName: propName, value })"
    />
  </div>
</template>
