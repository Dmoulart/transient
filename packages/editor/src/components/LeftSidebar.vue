<template>
  <div class="flex h-full flex-col">
    <div class="flex h-14 items-center border-b px-4"></div>
    <div class="flex-1 overflow-auto py-2">
      <nav class="grid gap-1 px-2">
        <UTree
          v-if="rootPrototype"
          @update:modelValue="
            (item: any) => {
              if (item && item.prototype) {
                prototype = item.prototype
              }
            }
          "
          :modelValue="selected"
          :items="items"
          :multiple="false"
          size="lg"
        >
          <template #item-label="{ item }">
            <UContextMenu
              :items="getContextMenuItems(item)"
              :ui="{
                content: 'w-48',
              }"
              ><div>{{ item.label }}</div>
            </UContextMenu>
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
  getPrototypeName,
  type Prototype,
  rootPrototype,
  usePrototype,
  type PrototypeSlot,
  type PrototypeSlots,
  useSchema,
  getSchema,
  usePrototypeSlotEdition,
} from '@/stores/use-prototype'
import { capitalize, computed } from 'vue'
import { type TreeItem } from '@nuxt/ui/components/Tree.vue'
import UTree from '@nuxt/ui/components/Tree.vue'

type ComponentTreeItem = TreeItem & ({ type: 'prototype'; prototype: Prototype } | { type: 'slot' })

function getContextMenuItems(item: ComponentTreeItem) {
  if (item.type === 'prototype') {
    const schema = getSchema(item.prototype)
    const appendToSlotsItem = Object.keys(schema.slots).map((slot) => {
      return {
        label: capitalize(slot),
        icon: 'i-lucide-between-horizontal-start',
        onSelect() {
          const slotEdition = usePrototypeSlotEdition()
          slotEdition.edit(item.prototype, slot)
        },
      }
    })

    return [
      { label: 'Append', icon: 'i-lucide-plus', children: appendToSlotsItem },
      {
        label: 'Remove',
        color: 'error' as const,
        icon: 'i-lucide-trash',
        onSelect() {},
      },
    ]
  }

  if (item.type === 'slot') {
    return [
      { label: 'Append', icon: 'i-lucide-plus' },
      { label: 'Clear', color: 'error' as const, icon: 'i-lucide-trash' },
    ]
  }

  return []
}

const prototype = usePrototype()

function findItem(
  items: Record<string, any>[],
  selectedPrototype: Prototype,
): TreeItem | undefined {
  for (const item of items) {
    const isSelected = item.prototype && item.prototype.id === selectedPrototype.id

    if (isSelected) {
      return item
    }

    if (!isSelected && item.children?.length > 0) {
      console.log('find children !')
      const selected = findItem(item.children, selectedPrototype)

      if (selected) {
        return selected
      }
    }
  }

  return undefined
}

const selected = computed(() => {
  if (!prototype.value) {
    return undefined
  }

  return findItem(items.value, prototype.value)
})

const items = computed<ComponentTreeItem[]>(() => {
  if (!rootPrototype.value) {
    return []
  }

  return [
    {
      type: 'prototype',
      label: getPrototypeName(rootPrototype.value.path),
      defaultExpanded: true,
      children: produceTree(rootPrototype.value.slots),
      icon: 'i-lucide-component',
      prototype: rootPrototype.value,
      value: String(rootPrototype.value.id),
    },
  ]
})

function produceTree(slots: PrototypeSlots, depth = 0): ComponentTreeItem[] {
  return Object.entries(slots).flatMap(([slotName, prototypes]) => {
    const children = prototypes.flatMap((prototypeSlot) => produceItem(prototypeSlot, depth + 1))

    if (slotName !== 'default') {
      return {
        type: 'slot',
        label: slotName,
        children,
        icon: 'i-lucide-square-dashed',
        value: `${slotName}-${depth}`,
      }
    }

    return children
  })
}

function produceItem(prototypeSlot: PrototypeSlot<any>, depth: number): ComponentTreeItem[] {
  return [
    {
      type: 'prototype',
      label: getPrototypeName(prototypeSlot.prototype.path),
      children: produceTree(prototypeSlot.prototype.slots, depth + 1),
      prototype: prototypeSlot.prototype,
      icon: 'i-lucide-dot',
      value: String(prototypeSlot.prototype.id),
    },
  ]
}
</script>
