<template>
  <Suspense>
    <!-- biome-ignore lint/a11y/useSemanticElements: the preview may render its own <button>, which cannot nest -->
    <div
      role="button"
      tabindex="0"
      :style="item ? styles.item : undefined"
      @click="emit('select', props)"
      @keydown.enter="emit('select', props)"
    >
      <div>
        {{ schema.tag }}
      </div>
      <component v-if="component" :is="component" v-bind="defaultProps" />
    </div>
  </Suspense>
</template>
<script setup lang="ts">
import type { TransientComponentSchema } from 'transient'
import { getComponentDefaultPropsValues } from 'transient'
import type { CSSProperties } from 'vue'
import { defineAsyncComponent, shallowRef, watch } from 'vue'
import { useDictionnary } from '@/lib/composables/use-dictionnary'

const props = withDefaults(
  defineProps<{
    schema: TransientComponentSchema
    item?: boolean
  }>(),
  {
    item: true,
  },
)

const emit = defineEmits<(e: 'select', data: { schema: TransientComponentSchema }) => void>()

const styles = {
  item: {
    cursor: 'pointer',
    width: '7.5rem',
    height: '7.5rem',
    display: 'flex',
    flexDirection: 'column' as CSSProperties['flexDirection'],
    gap: '0.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    overflow: 'hidden',
  } as CSSProperties,
}
const dictionnary = useDictionnary()

const component = shallowRef<unknown>(null)
const defaultProps = shallowRef<Record<string, unknown>>({})

watch(
  () => props.schema.path,
  () => {
    component.value = defineAsyncComponent({
      loader: () => import(/* @vite-ignore */ props.schema.path),
    })
    defaultProps.value = getComponentDefaultPropsValues(dictionnary.get(props.schema.tag).props)
  },
  { immediate: true },
)
</script>
