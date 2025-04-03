<template>
  <article class="w-30 h-30 flex flex-col gap-1">
    <div class="flex justify-center items-center overflow-hidden flex-1 border rounded-md">
      <Suspense> <component v-if="component" :is="component" /> </Suspense>
    </div>
    <footer class="truncate">{{ name }}</footer>
  </article>
</template>

<script setup lang="ts">
import { TransientComponentSchema } from 'transient'
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps<{ path: string; schema: TransientComponentSchema }>()

const component = computed(() => {
  return defineAsyncComponent(() => import(/* @vite-ignore */ props.path))
})

const name = props.path.split('/').at(-1)
</script>

<style></style>
