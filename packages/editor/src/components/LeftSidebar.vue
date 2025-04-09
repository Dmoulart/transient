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
                selectedPrototype = item.prototype
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
              ><div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%" />
              {{ item.label }}
            </UContextMenu>
          </template>
        </UTree>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getPrototypeName,
  type Prototype,
  rootPrototype,
  useSelectedPrototype,
  type PrototypeSlot,
  type PrototypeSlots,
  getSchema,
  usePrototypeSlotEdition,
} from '@/stores/use-prototype'
import { capitalize, computed, triggerRef } from 'vue'
import { type TreeItem } from '@nuxt/ui/components/Tree.vue'
import UTree from '@nuxt/ui/components/Tree.vue'

const selectedPrototype = useSelectedPrototype()

type ComponentTreeItem = TreeItem &
  (({ type: 'prototype'; prototype: Prototype } | { type: 'slot'; slotName: string }) & {
    parentPrototype: Prototype
    parentSlot?: string
  })

function generateMenuItems(item: ComponentTreeItem) {}

function append(item: ComponentTreeItem) {
  const schema = getSchema(item.prototype)

  const appendToSlotsItem = Object.keys(schema.slots).map((slot) => {
    return {
      label: capitalize(slot),
      icon: 'i-lucide-plus',
      onSelect() {
        const slotEdition = usePrototypeSlotEdition()
        slotEdition.start(item.prototype, slot)
      },
    }
  })

  return { label: 'Append', icon: 'i-lucide-arrow-down-to-dot', children: appendToSlotsItem }
}

function insert(item: ComponentTreeItem) {
  return {
    label: 'Insert',
    icon: 'i-lucide-plus',
    onSelect() {
      if (item.parentSlot && item.parentPrototype) {
        if (!item.parentPrototype.slots[item.parentSlot]) {
          throw new Error('Insert to unknown slot')
        }
        const slotEdition = usePrototypeSlotEdition()
        slotEdition.start(item.parentPrototype, item.parentSlot)
      }
    },
  }
}

function remove(item: ComponentTreeItem) {
  return {
    label: 'Remove',
    color: 'error' as const,
    icon: 'i-lucide-trash',
    onSelect() {
      if (item.parentSlot && item.parentPrototype) {
        const slot = item.parentPrototype.slots[item.parentSlot]

        if (!slot) {
          throw new Error('Insert to unknown slot')
        }

        const index = slot.findIndex((slot) => slot.prototype === item.prototype)

        if (index === -1) {
          throw new Error('Cannot find component to remove in slot')
        }

        item.parentPrototype.slots[item.parentSlot].splice(index, 1)
      }
    },
  }
}
function getContextMenuItems(item: ComponentTreeItem) {
  if (item.type === 'prototype') {
    const schema = getSchema(item.prototype)

    const appendToSlotsItem = Object.keys(schema.slots).map((slot) => {
      return {
        label: capitalize(slot),
        icon: 'i-lucide-plus',
        onSelect() {
          const slotEdition = usePrototypeSlotEdition()
          slotEdition.start(item.prototype, slot)
        },
      }
    })

    return [
      { label: 'Append', icon: 'i-lucide-arrow-down-to-dot', children: appendToSlotsItem },
      {
        label: 'Insert',
        icon: 'i-lucide-plus',
        onSelect() {
          if (item.parentSlot && item.parentPrototype) {
            if (!item.parentPrototype.slots[item.parentSlot]) {
              throw new Error('Insert to unknown slot')
            }
            const slotEdition = usePrototypeSlotEdition()
            slotEdition.start(item.parentPrototype, item.parentSlot)
          }
        },
      },
      {
        label: 'Remove',
        color: 'error' as const,
        icon: 'i-lucide-trash',
        onSelect() {
          if (item.parentSlot && item.parentPrototype) {
            const slot = item.parentPrototype.slots[item.parentSlot]

            if (!slot) {
              throw new Error('Insert to unknown slot')
            }

            const index = slot.findIndex((slot) => slot.prototype === item.prototype)

            if (index === -1) {
              throw new Error('Cannot find component to remove in slot')
            }

            item.parentPrototype.slots[item.parentSlot].splice(index, 1)
          }
        },
      },
    ]
  }

  if (item.type === 'slot') {
    return [
      {
        label: 'Append',
        icon: 'i-lucide-arrow-down-to-dot',
        onSelect() {
          if (item.slotName && item.parentPrototype) {
            if (!item.parentPrototype.slots[item.slotName]) {
              throw new Error('Insert to unknown slot')
            }
            const slotEdition = usePrototypeSlotEdition()
            slotEdition.start(item.parentPrototype, item.slotName)
          }
        },
      },
      {
        label: 'Clear',
        color: 'error' as const,
        icon: 'i-lucide-trash',
        onSelect() {
          if (item.slotName && item.parentPrototype) {
            if (!item.parentPrototype.slots[item.slotName]) {
              throw new Error('Insert to unknown slot')
            }
            item.parentPrototype.slots[item.slotName] = []
          }
        },
      },
    ]
  }

  return []
}

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
      const selected = findItem(item.children, selectedPrototype)

      if (selected) {
        return selected
      }
    }
  }

  return undefined
}

const selected = computed(() => {
  if (!selectedPrototype.value) {
    return undefined
  }

  return findItem(items.value, selectedPrototype.value)
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
      children: produceTree(rootPrototype.value.slots, rootPrototype.value),
      icon: 'i-lucide-component',
      prototype: rootPrototype.value,
      parentPrototype: rootPrototype.value,
      parentSlot: 'default',
      value: String(rootPrototype.value.id),
    },
  ]
})

function produceTree(
  slots: PrototypeSlots,
  parentPrototype: Prototype,
  depth = 0,
): ComponentTreeItem[] {
  return Object.entries(slots).flatMap(([slotName, prototypes]) => {
    const children = prototypes.flatMap((prototypeSlot) =>
      produceItem(prototypeSlot, parentPrototype, slotName, depth + 1),
    )

    if (slotName !== 'default' && children.length > 0) {
      return {
        type: 'slot',
        label: slotName,
        children,
        icon: 'i-lucide-square-dashed',
        value: `${slotName}-${depth}`,
        parentPrototype,
        slotName,
      }
    }

    return children
  })
}

function produceItem(
  prototypeSlot: PrototypeSlot<any>,
  parentPrototype: Prototype,
  parentSlot: string,
  depth: number,
): ComponentTreeItem[] {
  return [
    {
      type: 'prototype',
      label: getPrototypeName(prototypeSlot.prototype.path),
      children: produceTree(prototypeSlot.prototype.slots, prototypeSlot.prototype, depth + 1),
      prototype: prototypeSlot.prototype,
      icon: 'i-lucide-dot',
      value: String(prototypeSlot.prototype.id),
      parentPrototype: parentPrototype,
      parentSlot: parentSlot,
    },
  ]
}
</script>
