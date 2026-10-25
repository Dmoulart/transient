<script setup lang="ts">
import type { TransientComponentDictionnary, TransientElement } from '@transient/ir'
import { ref } from 'vue'
import _dictionnary from '@/assets/schemas/__schemas__.json'
import ElementPanel from './components/ElementPanel/ElementPanel.vue'

const dictionnary = _dictionnary as unknown as TransientComponentDictionnary

const query = new URLSearchParams(location.search)

const component = ref(structuredClone(dictionnary[query.get('comp') ?? 'HomePage']))

const instance = ref<TransientElement>({
  tag: component.value.tag,
  isComponent: true,
  attributes: {},
  id: crypto.randomUUID(),
})
</script>

<template>
  <div class="tr-root-base tr-root">
    <ElementPanel v-model="instance" :schema="component" :template="component.template" />
  </div>
</template>
