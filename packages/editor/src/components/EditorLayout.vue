<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <!-- Top header -->
    <header class="flex h-14 items-center border-b px-4 lg:px-6">
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-semibold">Editor</h1>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Share
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          Publish
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left sidebar -->
      <aside v-if="leftOpen" class="w-64 border-r bg-background">
        <LeftSidebar />
      </aside>

      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Main content -->
        <main class="flex flex-1 flex-col overflow-hidden">
          <!-- Panel above main content -->
          <div class="border-b bg-muted/40 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  <FileText class="mr-2 h-4 w-4" />
                  File
                </button>
                <button
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Add
                </button>
              </div>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    placeholder="Search..."
                    class="flex h-9 w-64 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty content area -->
          <div class="flex-1 overflow-auto p-6">
            <!-- <h3 v-if="prototype.path" class="text-lg font-medium">
              {{ prototype.path.split('/').at(-1) }}
            </h3> -->
            <div
              class="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-black"
            >
              <PrototypeView
                v-if="prototype.path"
                :path="prototype.path"
                :data="prototype.data"
                :slots="prototype.slots"
                :schema="dictionnary[prototype.path]"
                @append="
                  (event: any) => {
                    prototype.slots[event.slot] ??= []
                    prototype.slots[event.slot].push(event.path)
                  }
                "
              />
              <div v-else class="text-center">
                <h3 class="text-lg font-medium">Empty Content Area</h3>
                <p class="text-sm text-muted-foreground">
                  This is the main content area of your editor.
                </p>
              </div>
            </div>
          </div>
        </main>

        <!-- File Explorer -->
        <div class="h-64 overflow-hidden">
          <ComponentExplorer
            :dictionnary="dictionnary"
            @select="
              (path) => {
                prototype.path = path
              }
            "
          />
        </div>
      </div>

      <!-- Right sidebar -->
      <aside v-if="rightOpen" class="w-72 border-l bg-background">
        <RightSidebar
          v-if="prototype.path"
          :component-props="dictionnary[prototype.path].props"
          v-model="prototype.data"
        />
      </aside>
    </div>

    <!-- Toggle buttons for sidebars -->
    <button
      @click="leftOpen = !leftOpen"
      class="absolute left-0 top-1/2 -translate-y-1/2 rounded-none rounded-r-md border border-l-0 inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
    >
      <ChevronDown :class="leftOpen ? 'rotate-90' : '-rotate-90'" class="h-4 w-4" />
    </button>
    <button
      @click="rightOpen = !rightOpen"
      class="absolute right-0 top-1/2 -translate-y-1/2 rounded-none rounded-l-md border border-r-0 inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
    >
      <ChevronDown :class="rightOpen ? '-rotate-90' : 'rotate-90'" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, Plus, Search, ChevronDown } from 'lucide-vue-next'
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'
import ComponentExplorer from './ComponentExplorer.vue'
import type { TransientComponentDictionnary, TransientComponentSchema } from 'transient'
import { useTransient } from '@/stores/use-transient'

const dictionnary = ref<TransientComponentDictionnary>({})

fetch('http://127.0.0.1:3001/schemas')
  .then((schemas) => schemas.json())
  .then((s) => {
    dictionnary.value = s
    useTransient().dictionnary = s
  })

const prototype = ref<{
  path?: string
  schema: TransientComponentSchema
  slots: Record<string, string[]>
  data: Record<string, any>
}>({
  path: undefined,
  schema: {
    props: {},
    slots: {},
  },
  data: {},
  slots: {},
})

watch(
  () => prototype.value.path,
  () => {
    if (prototype.value.path) {
      console.log(Object.entries(dictionnary.value[prototype.value.path].props))
      prototype.value.data = Object.entries(dictionnary.value[prototype.value.path].props).reduce(
        (data, [key, type]) => {
          data[key] = type.default
          return data
        },
        {} as Record<string, any>,
      )
    } else {
      prototype.value.data = {}
    }
    prototype.value.slots = {}
  },
)

const leftOpen = ref(true)
const rightOpen = ref(true)
</script>
