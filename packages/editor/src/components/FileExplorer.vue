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
    <div class="overflow-auto p-2">
      <div class="min-w-max">
        <ul class="space-y-1">
          <li v-for="(item, index) in fileStructure" :key="index">
            <FileExplorerItem :item="item" :level="0" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FolderPlus, FilePlus, RefreshCw } from 'lucide-vue-next'
import FileExplorerItem from './FileExplorerItem.vue'

// Sample file structure data
const fileStructure = ref([
  {
    name: 'src',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'components',
        type: 'folder',
        expanded: true,
        children: [
          { name: 'EditorLayout.vue', type: 'file', fileType: 'vue' },
          { name: 'LeftSidebar.vue', type: 'file', fileType: 'vue' },
          { name: 'RightSidebar.vue', type: 'file', fileType: 'vue' },
          { name: 'FileExplorer.vue', type: 'file', fileType: 'vue' },
          { name: 'FileExplorerItem.vue', type: 'file', fileType: 'vue' },
        ],
      },
      {
        name: 'assets',
        type: 'folder',
        expanded: false,
        children: [
          { name: 'logo.svg', type: 'file', fileType: 'svg' },
          { name: 'style.css', type: 'file', fileType: 'css' },
        ],
      },
      { name: 'App.vue', type: 'file', fileType: 'vue' },
      { name: 'main.js', type: 'file', fileType: 'js' },
    ],
  },
  {
    name: 'public',
    type: 'folder',
    expanded: false,
    children: [
      { name: 'favicon.ico', type: 'file', fileType: 'ico' },
      { name: 'index.html', type: 'file', fileType: 'html' },
    ],
  },
  { name: 'package.json', type: 'file', fileType: 'json' },
  { name: 'README.md', type: 'file', fileType: 'md' },
  { name: '.gitignore', type: 'file', fileType: 'git' },
])
</script>

<style>
/* You can add any additional custom styles here */
</style>
