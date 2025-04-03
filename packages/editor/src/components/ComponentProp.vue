<template>
  <UInputNumber v-if="kind === 'decimal'" v-model="model" />
  <UInput v-else-if="kind === 'string'" v-model="model" />
  <USwitch v-else-if="kind === 'boolean'" v-model="model" />
  <USelectMenu
    v-else-if="kind === 'enum'"
    :items="(prop.type as TransientType<'enum'>).enum"
    v-model="model"
  />
</template>
<script setup lang="ts">
import { type TransientProp, type TransientType } from 'transient'
const props = defineProps<{ prop: TransientProp }>()

const kind = getTypeKind(props.prop.type)

const model = defineModel()

function getTypeKind(type: TransientType) {
  return typeof type === 'string' ? type : type.kind
}
</script>
