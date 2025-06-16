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
              :items="generateContextMenu(item)"
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
  getSchemaSlots,
  hasSchemaSlots,
  findParent,
} from '@/lib/use-prototype'
import { capitalize, computed, triggerRef } from 'vue'
import { type TreeItem } from '@nuxt/ui/components/Tree.vue'
import UTree from '@nuxt/ui/components/Tree.vue'

const selectedPrototype = useSelectedPrototype()

type ComponentTreeItem = TreeItem &
  ((
    | { type: 'prototype'; prototype: Prototype; slotName?: string }
    | { type: 'slot'; slotName: string }
  ) & {
    parentPrototype?: Prototype
  })

const MENU_TEMPLATE = [
  {
    condition: (item: ComponentTreeItem) =>
      item.slotName &&
      item.parentPrototype &&
      item.parentPrototype.slots[item.slotName].length > 1 &&
      item.parentPrototype.slots[item.slotName][0].prototype !== item.prototype,
    action: up,
  },
  {
    condition: (item: ComponentTreeItem) =>
      item.slotName &&
      item.parentPrototype &&
      item.parentPrototype.slots[item.slotName].length > 1 &&
      item.parentPrototype.slots[item.slotName].at(-1)!.prototype !== item.prototype,
    action: down,
  },
  {
    condition: (item: ComponentTreeItem) => item.prototype && hasSchemaSlots(item.prototype),
    action: append,
  },
  {
    condition: (item: ComponentTreeItem) => item.slotName && item.parentPrototype,
    action: insert,
  },
  {
    condition: (item: ComponentTreeItem) =>
      item.prototype &&
      item.slotName &&
      findParent(item.prototype) &&
      item.parentPrototype!.slots[item.slotName]?.length > 0,
    action: remove,
  },
  {
    condition: (item: ComponentTreeItem) =>
      item.type === 'slot' &&
      item.slotName &&
      item.parentPrototype &&
      item.parentPrototype.slots[item.slotName]?.length > 0,
    action: clear,
  },
]

function generateContextMenu(item: ComponentTreeItem) {
  const menu = []

  for (const { condition, action } of MENU_TEMPLATE) {
    if (condition(item)) {
      menu.push(action(item))
    }
  }

  if (menu.length === 0) {
    return undefined
  }

  return menu
}

function up(item: ComponentTreeItem) {
  return {
    label: 'Up',
    icon: 'i-lucide-move-up',
    onSelect() {
      if (!item.parentPrototype || !item.slotName) {
        throw new Error('Cannot move this prototype')
      }

      const index = item.parentPrototype.slots[item.slotName].findIndex(
        (child) => child.prototype == item.prototype,
      )

      if (index === -1) {
        throw new Error('Cannot find this prototype')
      }

      if (index === 0) {
        throw new Error('Expected prototype to be more than index 0')
      }

      const tmp = item.parentPrototype.slots[item.slotName][index - 1]
      item.parentPrototype.slots[item.slotName][index - 1] =
        item.parentPrototype.slots[item.slotName][index]
      item.parentPrototype.slots[item.slotName][index] = tmp
    },
  }
}

function down(item: ComponentTreeItem) {
  return {
    label: 'Down',
    icon: 'i-lucide-move-down',
    onSelect() {
      if (!item.parentPrototype || !item.slotName) {
        throw new Error('Cannot move this prototype')
      }

      const index = item.parentPrototype.slots[item.slotName].findIndex(
        (child) => child.prototype == item.prototype,
      )

      if (index === -1) {
        throw new Error('Cannot find this prototype')
      }

      if (index === item.parentPrototype.slots[item.slotName].length) {
        throw new Error('Expected prototype not to be the last one')
      }

      const tmp = item.parentPrototype.slots[item.slotName][index + 1]

      item.parentPrototype.slots[item.slotName][index + 1] =
        item.parentPrototype.slots[item.slotName][index]

      item.parentPrototype.slots[item.slotName][index] = tmp
    },
  }
}

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

  return { label: 'Append', icon: 'i-lucide-between-horizontal-start', children: appendToSlotsItem }
}

function insert(item: ComponentTreeItem) {
  return {
    label: 'Insert',
    icon: 'i-lucide-plus',
    onSelect() {
      if (item.slotName && item.parentPrototype) {
        if (!item.parentPrototype.slots[item.slotName]) {
          throw new Error('Insert to unknown slot')
        }
        const slotEdition = usePrototypeSlotEdition()
        slotEdition.start(item.parentPrototype, item.slotName)
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
      if (item.slotName && item.parentPrototype) {
        const slot = item.parentPrototype.slots[item.slotName]

        if (!slot) {
          throw new Error('Insert to unknown slot')
        }

        const index = slot.findIndex((slot) => slot.prototype === item.prototype)

        if (index === -1) {
          throw new Error('Cannot find component to remove in slot')
        }

        item.parentPrototype.slots[item.slotName].splice(index, 1)
      }
    },
  }
}

function clear(item: ComponentTreeItem) {
  return {
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
  }
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
      slotName: parentSlot,
    },
  ]
}
</script>
