<template>
  <TDrawer :open="!!schema" @close="emit('close')" @click.stop>
    <div v-if="schema" class="flex flex-col gap-4">
      <h2>{{ schema.tag }}</h2>
      <ElementProps
        :props-schema="schema.props"
        :values="componentProps ?? {}"
        @update="(e) => emit('update', e)"
      />
    </div>
  </TDrawer>
</template>
<script setup lang="ts">
import type { TransientComponentSchema, TransientElementAttributes, TransientProp } from '@transient/ir'
import ElementProps from './ElementProps.vue'

defineProps<{
  schema: TransientComponentSchema | null
  componentProps: TransientElementAttributes | null
}>()

const emit = defineEmits<{
  close: []
  update: [data: { prop: TransientProp; propName: string; value: unknown }]
}>()
</script>
