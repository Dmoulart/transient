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
        <LeftSidebar v-model="editedPrototype" />
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
          <div id="prototype-view" class="flex-1 overflow-auto p-6">
            <!-- <h3 v-if="prototype.path" class="text-lg font-medium">
              {{ prototype.path.split('/').at(-1) }}
            </h3> -->
            <div
              class="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-black"
            >
              <template v-if="rootPrototype">
                <PrototypeView
                  :prototype="rootPrototype"
                  @append="
                    ({ path, slot, to }) => {
                      const prototype = createPrototype(path)

                      to.slots[slot] ??= []
                      to.slots[slot].push({
                        type: 'unique',
                        prototype,
                      })

                      editedPrototype = prototype
                    }
                  "
                />
              </template>
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
                rootPrototype = createPrototype(path)
              }
            "
          />
        </div>
      </div>

      <!-- Right sidebar -->
      <aside v-if="rightOpen" class="w-72 border-l bg-background">
        <RightSidebar
          v-if="editedPrototype"
          :component-props="dictionnary[editedPrototype.path].props"
          v-model="editedPrototype.data"
        />
      </aside>
    </div>

    <AddComponentPanel />

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
import { getComponentDefaultPropsValues } from 'transient/src/transient'
import { useTransient } from '@/stores/use-transient'
import {
  useSelectedPrototype,
  createPrototype,
  useDictionnary,
  usePrototypeSlotEdition,
  useRootPrototype,
} from '@/stores/use-prototype'
import PrototypeView from './PrototypeView.vue'
import ComponentPanel from './AddComponentPanel.vue'
import AddComponentPanel from './AddComponentPanel.vue'
const dictionnary = useDictionnary()
const editedPrototype = useSelectedPrototype()
const rootPrototype = useRootPrototype()

fetch('http://127.0.0.1:3001/schemas')
  .then((schemas) => schemas.json())
  .then((s) => {
    dictionnary.value = s
    useTransient().dictionnary = s
  })

watch(rootPrototype, (prototype) => {
  editedPrototype.value = prototype

  if (prototype?.path) {
    prototype.data = getComponentDefaultPropsValues(dictionnary.value[prototype.path].props)
  }
})

const leftOpen = ref(true)
const rightOpen = ref(true)
</script>
