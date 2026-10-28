<script setup lang="ts">
import type { TransientComponentDictionnary } from '@transient/ir'
import { ref } from 'vue'
import _dictionnary from '@/assets/schemas/__schemas__.json'
import Button from '@/samples/Button.vue'
import ComponentEditor from './components/ComponentEditor.vue'
import ComponentRenderer from './components/ComponentRenderer.vue'
import { useSaveTemplate } from './lib/composables/use-save-template.ts'
import { resolveComponent } from './lib/playgrounds.ts'

const dictionnary = _dictionnary as unknown as TransientComponentDictionnary

// ?page=Slots loads another template (e2e fixtures live in src/tests/e2e), &debug=false hides the debug panel
const query = new URLSearchParams(location.search)

const component = ref(structuredClone(dictionnary[query.get('page') ?? 'HomePage']))

const template = useSaveTemplate(component)
</script>

<template>
  <ComponentEditor
    :resolve-component="resolveComponent"
    v-model="component"
    :dictionnary="dictionnary"
  />
  <Button @click="template.saveToLocalStorage">Save</Button>
  <Button @click="template.loadFromLocalStorage">Load</Button>
</template>
