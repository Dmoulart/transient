<template>
  <form @submit.prevent class="flex flex-col gap-4">
    <div v-for="(prop, field) of componentProps" class="flex flex-col gap-1">
      <UFormField :label="field">
        <ComponentProp :prop="prop" v-model="props[field]" />
      </UFormField>
    </div>
  </form>
</template>
<script setup lang="ts">
import type { TransientProps } from 'transient'
import ComponentProp from './ComponentProp.vue'

defineProps<{ componentProps: TransientProps }>()

const props = defineModel<Record<string, any>>({
  default: {},
})
</script>
