<template>
  <Suspense>
    <TransientBuilder v-if="page.current" :schema="page.current" :schema-dict="dictionnary" />
  </Suspense>

  <JsonViewer :value="page.current" copyable boxed sort expanded :expanded-depth="4" theme="dark" />
  <!-- <HomePage /> -->
</template>

<script setup lang="ts">
import TransientBuilder from './TransientBuilder.vue'
import { useDictionnary } from '@/stores/use-dictionnary'
import { usePage } from '@/stores/use-page'

// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const dictionnary = useDictionnary()

const page = usePage()

page.current = {
  ...dictionnary.value[
    '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue'
  ],
}
</script>
