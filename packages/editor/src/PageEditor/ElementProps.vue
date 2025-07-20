<template>
  <form @submit.prevent class="flex flex-col gap-4">
    <UFormField v-for="(prop, field) of componentProps" :label="field">
      <ElementProp
        :prop="prop"
        @update="(data) => emit('update', { ...data, propName: field })"
        :model-value="values[field]"
      />
    </UFormField>
  </form>
</template>
<script setup lang="ts">
import type { TransientProps } from 'transient'
import ElementProp from './ElementProp.vue'
import type { TransientProp } from 'transient/src/transient'
import type { TransientElementAttributes } from 'transient/src/transient/definition'

const props = defineProps<{ componentProps: TransientProps; values: TransientElementAttributes }>()
const emit = defineEmits<{
  update: [data: { prop: TransientProp; propName: string; value: any }]
}>() // Explicitly define the v-model event
</script>
