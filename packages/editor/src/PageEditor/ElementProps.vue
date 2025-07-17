<template>
  <form @submit.prevent class="flex flex-col gap-4">
    <UFormField v-for="(prop, field) of componentProps" :label="field">
      <ElementProp :prop="prop" v-model="model[field]" />
    </UFormField>
  </form>
</template>
<script setup lang="ts">
import type { TransientProps } from 'transient'
import ElementProp from './ElementProp.vue'
import { watch } from 'vue'

defineProps<{ componentProps: TransientProps }>()

const model = defineModel<Record<string, any>>({
  default: {},
})

model.value

watch(
  model,
  () => {
    console.log('model changed', { model: model.value })
  },
  {
    deep: true,
  },
)
</script>
