<template>
  <div class="flex h-full flex-col">
    <div class="flex h-14 items-center border-b px-4"></div>
    <div class="flex-1 overflow-auto py-2">
      <nav class="grid gap-1 px-2">
        <UTree :items="items">
          <template #app="{ item }">
            <p
              class="italic font-bold"
              @click="
                () => {
                  if (item.prototype) {
                    debugger
                    editedPrototype = item.prototype
                  }
                }
              "
            >
              {{ item.label }}
            </p>
          </template>
        </UTree>

        <!-- <button
          v-for="(item, index) in navItems"
          :key="index"
          class="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <component :is="item.icon" class="mr-2 h-4 w-4" />
          {{ item.label }}
        </button> -->
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  editedPrototype,
  getPrototypeName,
  rootPrototype,
  type Prototype,
  type PrototypeSlot,
  type PrototypeSlots,
} from '@/stores/use-prototype'
import { computed } from 'vue'

const items = computed(() => {
  if (!rootPrototype.value) {
    return []
  }

  return [
    {
      label: getPrototypeName(rootPrototype.value.path),
      slot: 'root' as const,
      defaultExpanded: true,
      children: produceTree(rootPrototype.value.slots),
      // icon: 'i-lucide-star',
      icon: 'i-lucide-component',
      selected: editedPrototype.value === rootPrototype.value,
      onSelect: (e: Event) => {
        editedPrototype.value = rootPrototype.value
      },
    },
  ]
})

function produceTree(slots: PrototypeSlots) {
  return Object.entries(slots).flatMap(([slotName, prototypes]) => {
    const children = prototypes.flatMap((prototypeSlot) => produceItem(prototypeSlot, slotName))
    if (slotName !== 'default') {
      return {
        label: slotName,
        children,
        defaultExpanded: true,
        icon: 'i-lucide-square-dashed',
      }
    }

    return children
  })
}

function produceItem(prototypeSlot: PrototypeSlot<any>, slotName: string): Array<any> {
  return [
    {
      label: getPrototypeName(prototypeSlot.prototype.path),
      children: produceTree(prototypeSlot.prototype.slots),
      selected: editedPrototype.value === prototypeSlot.prototype,
      onSelect: (e: Event) => {
        editedPrototype.value = prototypeSlot.prototype
      },
      // icon: 'i-lucide-puzzle',
      icon: 'i-lucide-dot',
    },
  ]
}
</script>

<style>
/* You can add any additional custom styles here */
</style>
