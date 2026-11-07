<script setup lang="ts">
import components from 'virtual:transient/components'
import dictionnary from 'virtual:transient/schemas'
import { ref } from 'vue'
import Button from '@/samples/Button.vue'
import ComponentEditor from './components/ComponentEditor.vue'
import { useSaveTemplate } from './lib/composables/use-save-template.ts'

// ?page=Slots loads another template (e2e fixtures live in src/tests/e2e), &debug=false hides the debug panel
const query = new URLSearchParams(location.search)

const component = ref(structuredClone(dictionnary[query.get('page') ?? 'HomePage']))

const template = useSaveTemplate(component)
</script>

<template>
  <ComponentEditor :components="components" v-model="component" :dictionnary="dictionnary" />
  <Button @click="template.saveToLocalStorage">Save</Button>
  <Button @click="template.loadFromLocalStorage">Load</Button>
</template>
