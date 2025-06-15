<template>
  <Suspense>
    <TransientBuilder
      v-if="page"
      :schema="page"
      :registry="registry"
      @replace="replace"
      @remove="remove"
      @append="append"
    />
  </Suspense>

  <JsonViewer
    v-if="page"
    :value="page"
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
import { registry } from '@/stores/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import Button from '@/samples/Button.vue'
import { usePage } from '@/stores/use-page'

const { page, replace, remove, append, saveToLocalStorage, loadFromLocalStorage } = usePage()
</script>
