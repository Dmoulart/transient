<template>
  <Suspense>
    <TransientBuilder
      v-if="Object.keys(dictionnary).length"
      :schema="page"
      :schema-dict="dictionnary"
    />
  </Suspense>

  <JsonViewer :value="page" copyable boxed sort expanded :expanded-depth="4" theme="dark" />
  <!-- <HomePage /> -->
</template>

<script setup lang="ts">
import TransientBuilder from './TransientBuilder.vue'
import schemas from '@/assets/schemas/__schemas__.json'
import { useDictionnary } from '@/stores/use-dictionnary'
import { ref } from 'vue'

// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const dictionnary = useDictionnary()
dictionnary.value = schemas as any

const page = ref({
  ...dictionnary.value[
    '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue'
  ],
})
</script>
