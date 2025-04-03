<template>
  <div class="flex h-full flex-col border-t">
    <div class="flex h-10 items-center justify-between border-b bg-muted/30 px-4">
      <h3 class="text-sm font-medium">Files</h3>
      <div class="flex items-center gap-1">
        <button class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
          <FolderPlus class="h-4 w-4" />
          <span class="sr-only">New Folder</span>
        </button>
        <button class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
          <FilePlus class="h-4 w-4" />
          <span class="sr-only">New File</span>
        </button>
        <button class="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
          <RefreshCw class="h-4 w-4" />
          <span class="sr-only">Refresh</span>
        </button>
      </div>
    </div>
    <div class="overflow-y-scroll p-2">
      <div class="w-full">
        <div class="space-y-1 flex flex-row overflow-hidden flex-wrap gap-5">
          <ComponentView
            v-for="(schema, path, index) in dictionnary"
            :schema="schema"
            :path="path"
            :key="index"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FolderPlus, FilePlus, RefreshCw } from 'lucide-vue-next'
import FileExplorerItem from './FileExplorerItem.vue'
import ComponentView from './ComponentView.vue'
import { TransientComponentDictionnary } from 'transient'

const props = defineProps<{ dictionnary: TransientComponentDictionnary }>()
</script>

<style>
/* You can add any additional custom styles here */
</style>
