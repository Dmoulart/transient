<script setup lang="ts">
import { type ComponentDictionnary } from '@/lib/composables/use-dictionnary'
import { type Index, useIndex } from '@/lib/composables/use-index'
import { assert, assertIsDefined, type TransientElement, type TransientTemplate } from 'transient'
import { h, Text, type VNode } from 'vue'

const props = defineProps<{
  template: TransientTemplate
  dictionnary: ComponentDictionnary
  slotLocation?: { slotName: string; ownerId: string }
  components: Record<string, unknown>
}>()

const index = defineModel<Index>({ default: () => useIndex() })

const renderTemplate = () => {
  index.value.elements.clear()
  index.value.slots.clear()
  const vnodes: VNode[] = []

  vnodes.push(...render(props.template.elements))

  return vnodes
}

function render(elements: TransientElement[]) {
  const vnodes: VNode[] = []
  for (const element of elements) {
    if (element.isComponent) {
      vnodes.push(...renderComponent(element))
    } else {
      vnodes.push(...renderElement(element))
    }
  }
  return vnodes
}

function renderComponent(element: TransientElement): VNode[] {
  assert(element.isComponent)

  const component = props.components[element.tag]

  assertIsDefined(component)

  // declared slots too, so empty ones still get their markers
  const slotNames = new Set([
    ...Object.keys(props.dictionnary.get(element.tag)?.slots ?? {}),
    ...Object.keys(element.slots ?? {}),
  ])
  const slots = Object.fromEntries(
    [...slotNames].map((slotName) => [
      slotName,
      () => renderSlot(element, slotName, element.slots?.[slotName] ?? []),
    ]),
  )

  const attributes = parseElementAttributes(element)

  const componentVnode = h(component, attributes, slots)
  index.value.elements.set(element.id, componentVnode)
  // freeze
  // componentVnode.shapeFlag = 1 << 3
  return [componentVnode]
}

function renderSlot(parent: TransientElement, slotName: string, children: TransientElement[]) {
  const childrenVnodes = render(children)
  index.value.slots.set(`${parent.id}:${slotName}`, childrenVnodes)
  return childrenVnodes
}

function renderElement(element: TransientElement) {
  assert(!element.isComponent)

  if (element.tag === '#text') {
    const text = renderText(element)
    return [text]
  }

  const attributes = {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([key, value]) => [key, value.expression]),
    ),
  }

  const children: VNode[] = []
  if (element.slots && element.slots.default) {
    children.push(...render(element.slots.default))
  }

  const elVnode = h(element.tag, attributes, children)
  index.value.elements.set(element.id, elVnode)
  return [elVnode]
}

function renderText(element: TransientElement) {
  assert(element.tag === '#text')
  const text = element?.attributes?.value?.expression ?? ''
  const textVnode = h(Text, text)
  index.value.elements.set(element.id, textVnode)
  return textVnode
}

function parseElementAttributes(element: TransientElement) {
  return {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([key, value]) => [key, value.expression]),
    ),
  }
}
</script>

<template>
  <render-template />
</template>
