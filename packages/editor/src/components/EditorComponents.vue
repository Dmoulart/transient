<template>
  <div class="outer">
    <div class="full-width">
      <div class="component-container">
        <EditorComponent
          v-for="(schema, name) in registry.all()"
          :key="schema.path"
          :path="schema.path as string"
          :schema="schema"
          v-on="$attrs"
          @select="(data) => emit('select', data)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import EditorComponent from './EditorComponent.vue'
import type { TransientComponentSchema } from 'transient'

const registry = useDictionnary()
const emit = defineEmits<{
  (e: 'select', data: { schema: TransientComponentSchema }): void
}>()
</script>

<style scoped>
.outer {
  overflow-y: scroll;
  padding: 0.5rem;
}

.full-width {
  width: 100%;
}

.component-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow: hidden;
  gap: 1.25rem;
}

.component-container > * + * {
  margin-top: 0.25rem;
}
</style>
