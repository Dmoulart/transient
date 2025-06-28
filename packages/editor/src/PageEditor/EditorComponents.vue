<template>
  <div class="outer">
    <div class="full-width">
      <div class="component-container">
        <EditorComponent
          v-for="(schema, name) in registry"
          :key="schema.path"
          :path="schema.path as string"
          :schema="schema"
          v-on="$attrs"
          @select="(data) => $emit('select', data)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegistry } from '@/lib/use-dictionnary'
import EditorComponent from './EditorComponent.vue'

const registry = useRegistry()
</script>

<style scoped>
.outer {
  overflow-y: scroll; /* overflow-y-scroll */
  padding: 0.5rem; /* p-2 */
}

.full-width {
  width: 100%; /* w-full */
}

.component-container {
  display: flex; /* flex */
  flex-direction: row; /* flex-row */
  flex-wrap: wrap; /* flex-wrap */
  overflow: hidden; /* overflow-hidden */
  gap: 1.25rem; /* gap-5 = 5 * 0.25rem */
}

.component-container > * + * {
  margin-top: 0.25rem; /* space-y-1 (approximé) */
}
</style>
