<template>
  <form @submit.prevent class="flex flex-col gap-4">
    <UFormField :key="field" v-for="(prop, field) of propsSchema" :label="field">
      <ElementProp
        :prop="prop"
        @update="(data) => emit('update', { ...data, propName: field })"
        :model-value="values[field]"
      />
    </UFormField>
  </form>
</template>
<script setup lang="ts">
import type { TransientElementAttributes, TransientProp, TransientProps } from 'transient'
import ElementProp from './ElementProp.vue'

defineProps<{ propsSchema: TransientProps; values: TransientElementAttributes }>()

const emit = defineEmits<{
  update: [data: { prop: TransientProp; propName: string; value: unknown }]
}>()
</script>
