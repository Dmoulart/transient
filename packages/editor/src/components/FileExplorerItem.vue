<template>
  <div>
    <div
      :class="[
        'flex items-center rounded-md px-2 py-1 hover:bg-muted',
        item.type === 'file' && 'text-sm',
        item.type === 'folder' && 'font-medium',
      ]"
      :style="{ paddingLeft: `${level * 12 + 8}px` }"
    >
      <button
        v-if="item.type === 'folder' && item.children && item.children.length"
        @click="toggleExpand"
        class="mr-1 inline-flex h-4 w-4 items-center justify-center"
      >
        <ChevronRight
          :class="item.expanded ? 'rotate-90' : ''"
          class="h-3.5 w-3.5 transition-transform"
        />
      </button>
      <span v-else class="mr-1 w-4"></span>

      <component :is="getIcon()" class="mr-2 h-4 w-4" :class="getIconColor()" />
      <span class="truncate">{{ item.name }}</span>
    </div>

    <div v-if="item.type === 'folder' && item.expanded">
      <ul>
        <li v-for="(child, index) in item.children" :key="index">
          <FileExplorerItem :item="child" :level="level + 1" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronRight,
  Folder,
  File,
  FileText,
  FileCode,
  FileJson,
  FileImage,
  FileType,
} from 'lucide-vue-next'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
})

const toggleExpand = () => {
  if (props.item.type === 'folder') {
    props.item.expanded = !props.item.expanded
  }
}

const getIcon = () => {
  if (props.item.type === 'folder') {
    return Folder
  }

  // File type icons
  switch (props.item.fileType) {
    case 'vue':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return FileCode
    case 'json':
      return FileJson
    case 'md':
    case 'txt':
      return FileText
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return FileImage
    default:
      return File
  }
}

const getIconColor = () => {
  if (props.item.type === 'folder') {
    return 'text-yellow-500'
  }

  // File type colors
  switch (props.item.fileType) {
    case 'vue':
      return 'text-green-500'
    case 'js':
      return 'text-yellow-400'
    case 'ts':
      return 'text-blue-500'
    case 'json':
      return 'text-orange-400'
    case 'md':
      return 'text-gray-500'
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'text-purple-500'
    default:
      return 'text-gray-400'
  }
}
</script>

<style>
/* You can add any additional custom styles here */
</style>
