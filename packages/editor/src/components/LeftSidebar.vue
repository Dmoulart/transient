<template>
  <div class="flex h-full flex-col">
    <div class="flex h-14 items-center border-b px-4">
      <h2 class="text-lg font-semibold">Navigation</h2>
    </div>
    <div class="flex-1 overflow-auto py-2">
      <nav class="grid gap-1 px-2">
        <button
          v-for="(item, index) in navItems"
          :key="index"
          class="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <component :is="item.icon" class="mr-2 h-4 w-4" />
          {{ item.label }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { Layers, FileText, Users, BarChart, Settings } from 'lucide-vue-next'

const navItems = [
  { icon: Layers, label: 'Projects' },
  { icon: FileText, label: 'Documents' },
  { icon: Users, label: 'Team' },
  { icon: BarChart, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
]
</script>

<style>
/* You can add any additional custom styles here */
</style>
