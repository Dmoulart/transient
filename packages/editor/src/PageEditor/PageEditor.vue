<template>
  <Suspense>
    <TransientBuilder v-if="contents" :template="contents" :registry="registry" />
  </Suspense>

  <JsonViewer
    v-if="contents"
    :value="contents"
    copyable
    boxed
    sort
    expanded
    :expanded-depth="4"
    theme="dark"
  />

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
</template>

<script setup lang="ts">
import { getTransientComponentSchema, registry } from '@/lib/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useEdition } from '@/lib/use-edition'
import { ref, shallowRef, triggerRef } from 'vue'

const component = getTransientComponentSchema(
  '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
)

const { contents, replace, render, saveToLocalStorage, loadFromLocalStorage } = usePage(
  component.template!,
)
const k = ref(0)

const { onEditEnd } = useEdition()

onEditEnd((parent) => {
  replace(parent)
  render()
  triggerRef(page)
  k.value += 1
})
</script>
