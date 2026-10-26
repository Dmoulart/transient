<script setup lang="ts">
import {
  type BindingValue,
  getTypeKind,
  type TransientElementAttributes,
  type TransientProp,
  type TransientProps,
} from '@transient/ir'
import { useId } from 'vue'
import PropField from './PropField.vue'

defineProps<{ propsSchema: TransientProps; values: TransientElementAttributes }>()

const emit = defineEmits<{
  update: [data: { prop: TransientProp; propName: string; value: BindingValue }]
}>()

const id = useId()
</script>

<template>
  <div v-for="(prop, name) of propsSchema" :key="name" class="tr-prop-row">
    <div class="tr-prop-head">
      <label class="tr-prop-name" :for="`${id}-${name}`">
        {{ name }}
        <template v-if="prop.required">
          <span class="tr-text-danger" aria-hidden="true">*</span>
          <span class="tr-sr-only">(requis)</span>
        </template>
      </label>
      <span class="tr-prop-type">{{ getTypeKind(prop.type) }}</span>
    </div>
    <PropField
      :id="`${id}-${name}`"
      :prop="prop"
      :model-value="values[name]?.expression"
      @update:model-value="(value) => emit('update', { prop, propName: name, value })"
    />
  </div>
</template>
