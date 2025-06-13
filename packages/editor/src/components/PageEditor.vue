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
  <HomePage />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import TransientBuilder from './TransientBuilder.vue'
import { useDictionnary, loadDictionnary } from '@/stores/use-prototype'
import HomePage from '@/samples/HomePage.vue'
loadDictionnary()

const dictionnary = useDictionnary()
</script>
