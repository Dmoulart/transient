<template>
  <UInputNumber v-if="kind === 'decimal'" :model-value="value" @update:model-value="updateValue" />
  <UInput v-else-if="kind === 'string'" :model-value="value" @update:model-value="updateValue" />
  <USwitch v-else-if="kind === 'boolean'" :model-value="value" @update:model-value="updateValue" />
  <USelectMenu
    v-else-if="kind === 'enum'"
    :items="(prop.type as TransientType<'enum'>).enum"
    :model-value="value"
    @update:model-value="updateValue"
  />
</template>

<script setup lang="ts">
import type { TransientAttribute, TransientProp, TransientType } from '@transient/ir'
import { computed } from 'vue'

const props = defineProps<{
  prop: TransientProp
  modelValue: TransientAttribute
}>()

const emit = defineEmits<{ update: [data: { prop: TransientProp; value: TransientAttribute }] }>()

const kind = computed(() => getTypeKind(props.prop.type))

const value = computed(() => {
  return props.modelValue.expression
})

function getTypeKind(type: TransientType) {
  return typeof type === 'string' ? type : type.kind
}

function updateValue(newValue: TransientAttribute) {
  emit('update', { prop: props.prop, value: newValue })
}
</script>
