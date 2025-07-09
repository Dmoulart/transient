<template>
  <Suspense>
    <div :style="item ? styles.item : undefined" @click="emit('select', props)">
      <component v-if="component" :is="component" v-bind="defaultProps" />
    </div>
  </Suspense>
</template>
<script setup lang="ts">
import { useDictionnary } from '@/lib/use-dictionnary'
import { getComponentDefaultPropsValues } from 'transient/src/transient/ast'
import type { TransientComponentSchema } from 'transient/src/transient/definition'
import { computed, defineAsyncComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    schema: TransientComponentSchema
    item?: boolean
  }>(),
  {
    item: true,
  },
)

const emit = defineEmits<{
  (e: 'select', data: { schema: TransientComponentSchema }): void
}>()
import type { CSSProperties } from 'vue'

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

const defaultProps = getComponentDefaultPropsValues(dictionnary.get(props.schema.tag).props)

const component = computed(() => {
  props.schema.path // don't remove this haaha
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.schema.path),
  })
})
</script>
