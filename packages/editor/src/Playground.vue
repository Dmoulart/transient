<script setup lang="ts">
import type { TransientComponentDictionnary } from '@transient/ir'
import { ref,   } from 'vue'
import _dictionnary from '@/assets/schemas/__schemas__.json'
import { useTemplate } from '@/lib/composables/use-template.ts'
import Button from '@/samples/Button.vue'
import ComponentEditor from './components/ComponentEditor.vue'
import { resolveComponent } from './lib/playgrounds.ts'

const dictionnary = _dictionnary as unknown as TransientComponentDictionnary

// ?page=Slots loads another template (e2e fixtures live in src/tests/e2e), &debug=false hides the debug panel
const query = new URLSearchParams(location.search)

const component = ref(structuredClone(dictionnary[query.get('page') ?? 'HomePage']))
const debug = query.get('debug') !== 'false'

const template = useTemplate(component)

</script>

<template>
  <UApp>
    <ComponentEditor :resolve-component="resolveComponent" v-model="component" :dictionnary="dictionnary" :debug="debug" />
    <Button @click="template.saveToLocalStorage">Save</Button>
    <Button @click="template.loadFromLocalStorage">Load</Button>
  </UApp>
</template>
