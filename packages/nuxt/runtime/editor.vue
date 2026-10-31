<!-- <script setup lang="ts">
import { pascalCase } from '@transient/core'
import { ComponentEditor } from '@transient/editor'
import '@transient/editor/style.css'
import components from 'virtual:transient/components'
import { type Component, ref } from 'vue'
import { useRoute } from '#imports'

function resolveComponent(tag: string) {
  return (components as Record<string, Component>)[pascalCase(tag)] ?? null
}

// /__transient?page=art-therapie
const page = String(useRoute().query.page ?? 'index')
const component = ref(structuredClone(dictionnary[page]))
</script>

<template>
  <p v-if="!component">Unknown page "{{ page }}"</p>
  <ComponentEditor
    v-else
    v-model="component"
    :dictionnary="dictionnary"
    :resolve-component="resolveComponent"
  />
</template> -->
