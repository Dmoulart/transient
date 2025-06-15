<template>
  <Suspense>
    <TransientBuilder :schema="page" :registry="registry" @replace="onReplace" />
  </Suspense>

  <JsonViewer :value="page" copyable boxed sort expanded :expanded-depth="4" theme="dark" />
  <!-- <HomePage /> -->
</template>

<script setup lang="ts">
import { registry } from '@/stores/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import { shallowRef } from 'vue'
import type { TransientElement } from 'transient/src/transient/definition'
import { replaceElement } from 'transient/src/transient/ast'

const cloneSchema = (name: string) => ({
  ...registry[name],
})

const page = shallowRef(
  cloneSchema(
    '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
  ),
)

const modifiedPage = cloneSchema(
  '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
)

function onReplace(newElement: TransientElement) {
  replaceElement(modifiedPage.template?.elements ?? [], newElement)
}

document.addEventListener('focusout', (e) => {
  page.value = modifiedPage
  console.log('re-render', page.value)
})
</script>
