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
    <ComponentList :dictionnary="dictionnary" @select="$emit('select', $event)" />
  </div>
</template>

<script setup lang="ts">
import { FolderPlus, FilePlus, RefreshCw } from 'lucide-vue-next'
import ComponentList from './ComponentList.vue'
import { type TransientComponentDictionnary } from 'transient'
defineProps<{ dictionnary: TransientComponentDictionnary }>()
</script>

<style>
/* You can add any additional custom styles here */
</style>
