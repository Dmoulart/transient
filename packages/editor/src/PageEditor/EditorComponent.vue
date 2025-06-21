<template>
  <Suspense>
    <div :style="item ? styles.item : undefined">
      <component v-if="component" :is="component" v-bind="defaultProps" />
    </div>
  </Suspense>
</template>
<script setup lang="ts">
import { useRegistry } from '@/lib/use-dictionnary'
import { getComponentDefaultPropsValues } from 'transient/src/transient/ast'
import type { TransientComponentSchema } from 'transient/src/transient/definition'
import { computed, defineAsyncComponent } from 'vue'
const props = withDefaults(
  defineProps<{
    path: string
    schema: TransientComponentSchema
    item?: boolean
  }>(),
  {
    item: true,
  },
)
const styles = {
  item: {
    cursor: 'grabbing',
    width: '7.5rem',
    height: '7.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    overflow: 'hidden',
  },
}
const registry = useRegistry()

const defaultProps = getComponentDefaultPropsValues(registry.value[props.path].props)

const component = computed(() => {
  props.path // don't remove this haaha
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.path),
  })
})
</script>
