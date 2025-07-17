<template>
  <div class="flex h-full flex-col">
    <div class="flex h-14 items-center border-b px-4">
      <h2 class="text-lg font-semibold">Properties</h2>
    </div>
    <div class="flex-1 overflow-y-scroll overflow-x-hidden">
      <div class="border-b">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'flex-1 justify-center text-sm px-3 py-1.5 border-b-2 transition-all',
              activeTab === tab
                ? 'border-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ]"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'style'" class="p-4">
        <div class="grid gap-4">
          <div>
            <label class="text-sm font-medium">Width</label>
            <input
              type="text"
              placeholder="100%"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label class="text-sm font-medium">Height</label>
            <input
              type="text"
              placeholder="auto"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label class="text-sm font-medium">Padding</label>
            <input
              type="text"
              placeholder="0px"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <hr class="my-2" />
          <div>
            <label class="text-sm font-medium">Background</label>
            <input
              type="text"
              placeholder="#ffffff"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'props'" class="p-4">
        <ComponentProps
          v-if="componentProps"
          :component-props="componentProps"
          v-model="componentData"
        />
      </div>

      <div v-if="activeTab === 'schema'" class="p-4">
        <JsonViewer :value="schema" copyable boxed sort expanded :expanded-depth="4" theme="dark" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import ComponentProps from './ComponentProps.vue'
import type { TransientProps } from 'transient'
import { useSchema } from '@/lib/use-prototype'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

defineProps<{ componentProps?: TransientProps }>()

const componentData = defineModel<Record<string, any>>({ default: {} })
const tabs = ['style', 'props', 'schema']
const activeTab = ref('props')

const schema = useSchema()
</script>
