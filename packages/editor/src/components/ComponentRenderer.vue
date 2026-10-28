<script setup lang="ts">
import { assert } from '@transient/core'
import type {
  TransientComponentDictionnary,
  TransientElement,
  TransientTemplate,
} from '@transient/ir'
import { h, resolveComponent as resolveVueComponent, Text, type VNode } from 'vue'
import type { ResolveComponent } from '@/lib/components.ts'
import { parseElementAttributes } from '@/lib/transient/attributes.ts'

const props = defineProps<{
  template: TransientTemplate
  dictionnary: TransientComponentDictionnary
  resolveComponent?: ResolveComponent
}>()

const RenderTemplate = () => {
  const vnodes: VNode[] = []

  vnodes.push(...render(props.template.elements))

  return vnodes
}

function render(elements: TransientElement[]) {
  const vnodes: VNode[] = []
  for (const element of elements) {
    if (element.isComponent) {
      vnodes.push(renderComponent(element))
    } else {
      vnodes.push(renderElement(element))
    }
  }
  return vnodes
}

function renderComponent(element: TransientElement): VNode {
  const schema = props.dictionnary[element.tag]

  const component =
    props.resolveComponent?.(element.tag, schema) ?? resolveVueComponent(element.tag)

  const schemaSlots = schema.slots
    ? Object.fromEntries(Object.keys(schema.slots).map((slotName) => [slotName, []]))
    : {}

  const slots = Object.fromEntries(
    Object.entries({ ...schemaSlots, ...(element.slots ?? {}) }).map(([slotName, children]) => {
      return [slotName, () => render(children)]
    }),
  )

  const attributes = parseElementAttributes(element)

  return h(component, attributes, slots)
}

function renderElement(element: TransientElement) {
  assert(!element.isComponent)

  if (element.tag === '#text') {
    return renderText(element)
  }

  const attributes = parseElementAttributes(element)

  const children: VNode[] = []

  if (element.slots?.default) {
    children.push(...render(element.slots.default))
  }

  return h(element.tag, attributes, children)
}

function renderText(element: TransientElement) {
  assert(element.tag === '#text')
  const text = String(element.attributes.value?.expression ?? '')
  const textVnode = h(Text, text)
  return textVnode
}
</script>

<template>
  <RenderTemplate />
</template>
