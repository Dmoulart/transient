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
import { type TransientProp, type TransientType } from 'transient'
import type { TransientAttribute } from 'transient'
import { computed } from 'vue'

const props = defineProps<{
  prop: TransientProp
  modelValue: TransientAttribute // Explicitly define the v-model prop as modelValue
}>()

const emit = defineEmits<{ update: [data: { prop: TransientProp; value: TransientAttribute }] }>() // Explicitly define the v-model event

const kind = computed(() => getTypeKind(props.prop.type))

const value = computed(() => {
  return props.modelValue.expression
})

function getTypeKind(type: TransientType) {
  return typeof type === 'string' ? type : type.kind
}

function updateValue(newValue: any) {
  emit('update', { prop: props.prop, value: newValue })
}
</script>
