<template>
  <Suspense>
    <TransientBuilder
      v-if="Object.keys(dictionnary).length"
      :schema="
        dictionnary[
          '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue'
        ]
      "
      :schema-dict="dictionnary"
    />
  </Suspense>

  <JsonViewer
    :value="
      dictionnary[
        '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue'
      ]
    "
    copyable
    boxed
    sort
    expanded
    :expanded-depth="4"
    theme="dark"
  />
  <!-- <HomePage /> -->
</template>

<script setup lang="ts">
import TransientBuilder from './TransientBuilder.vue'
import schemas from '@/assets/schemas/__schemas__.json'
import { useDictionnary } from '@/stores/use-dictionnary'

// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const dictionnary = useDictionnary()
dictionnary.value = schemas as any
</script>
