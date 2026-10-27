<template>
  <Suspense>
    <!-- biome-ignore lint/a11y/useSemanticElements: the preview may render its own <button>, which cannot nest -->
    <div
      role="button"
      tabindex="0"
      class="tr-card"
      data-test="component-item"
      :data-tag="schema.tag"
      @click="emit('select', props)"
      @keydown.enter="emit('select', props)"
    >
      <div v-if="component" ref="thumb" class="tr-card-thumb tr-relative" inert>
        <div
          ref="content"
          class="tr-absolute tr-top-1/2 tr-left-1/2 tr-origin-center tr-flex tr-justify-center"
          :style="{ width: 'max-content', transform: `translate(-50%, -50%) scale(${scale})` }"
        >
          <component :is="component" v-bind="defaultProps" />
        </div>
      </div>
      <div v-else class="tr-card-thumb-fallback">
        <span class="tr-i-lucide-box" aria-hidden="true" />
      </div>
      <div class="tr-card-name">{{ schema.tag }}</div>
    </div>
  </Suspense>
</template>
<script setup lang="ts">
import type { TransientComponentDictionnary, TransientComponentSchema } from '@transient/ir'
import { getComponentDefaultPropsValues } from '@transient/ir'
import { useElementSize } from '@vueuse/core'
import { computed, defineAsyncComponent, shallowRef, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  schema: TransientComponentSchema
  dictionnary: TransientComponentDictionnary
}>()

const emit = defineEmits<(e: 'select', data: { schema: TransientComponentSchema }) => void>()

const thumb = useTemplateRef('thumb')
const content = useTemplateRef('content')
const thumbSize = useElementSize(thumb)
const contentSize = useElementSize(content)

const scale = computed(() =>
  Math.min(
    1,
    contentSize.width.value ? thumbSize.width.value / contentSize.width.value : 1,
    contentSize.height.value ? thumbSize.height.value / contentSize.height.value : 1,
  ),
)

const component = shallowRef<unknown>(null)
const defaultProps = shallowRef<Record<string, unknown>>({})

watch(
  () => props.schema.path,
  () => {
    component.value = defineAsyncComponent({
      loader: () => import(/* @vite-ignore */ props.schema.path),
    })
    defaultProps.value = getComponentDefaultPropsValues(props.dictionnary[props.schema.tag].props)
  },
  { immediate: true },
)
</script>
