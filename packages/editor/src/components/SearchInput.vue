<script setup lang="ts">
import { FieldControl, FieldRoot } from 'reka-ui'
import { nextTick, onMounted, useTemplateRef } from 'vue'

const props = defineProps<{ placeholder?: string; focusOnMount?: boolean }>()

const model = defineModel<string>({ default: '' })

const input = useTemplateRef('input')
onMounted(async () => {
  if (props.focusOnMount) {
    await nextTick()
    input.value?.$el.focus()
  }
})
</script>

<template>
  <FieldRoot class="tr-search">
    <span class="tr-search-icon tr-i-lucide-search" aria-hidden="true" />
    <FieldControl
      ref="input"
      v-model="model"
      type="search"
      class="tr-search-input"
      :placeholder="placeholder"
    />
    <button
      v-if="model"
      type="button"
      class="tr-search-clear"
      aria-label="Clear search"
      @click="model = ''"
    >
      <span class="tr-i-lucide-x" aria-hidden="true" />
    </button>
  </FieldRoot>
</template>
