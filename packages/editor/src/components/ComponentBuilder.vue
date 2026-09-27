<script setup lang="ts">
import { type ComponentDictionnary } from '@/lib/composables/use-dictionnary'
import { assert, assertIsDefined, type TransientElement, type TransientTemplate } from 'transient'
import { h, Text, Comment, type VNode } from 'vue'

const props = defineProps<{
  template: TransientTemplate
  dictionnary: ComponentDictionnary
  slotLocation?: { slotName: string; ownerId: string }
  components: Record<string, unknown>
}>()

const renderTemplate = () => {
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

  const slots = {
    ...Object.fromEntries(
      Object.entries(element.slots ?? {}).map(([slotName, children]) => {
        return [slotName, () => renderSlot(element, slotName, children)]
      }),
    ),
  }

  const attributes = parseElementAttributes(element)

  return [
    hOpenIr('component', element.id, element.tag),
    h(component, attributes, slots),
    hCloseIr(element.id),
  ]
}

function renderSlot(parent: TransientElement, slotName: string, children: TransientElement[]) {
  return [hOpenIr('slot', parent.id, slotName), ...render(children), hCloseIr(parent.id, slotName)]
}

function renderElement(element: TransientElement) {
  assert(!element.isComponent)

  if (element.tag === '#text') {
    return [renderText(element)]
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

  return [
    hOpenIr('element', element.id, element.tag),
    h(element.tag, attributes, children),
    hCloseIr(element.id),
  ]
}

function renderText(element: TransientElement) {
  assert(element.tag === '#text')
  const text = element?.attributes?.value?.expression ?? ''
  return h(Text, text)
}

function parseElementAttributes(element: TransientElement) {
  return {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([key, value]) => [key, value.expression]),
    ),
  }
}

function hOpenIr(type: string, key: string, name?: string) {
  return h(Comment, openIrTag(type, key, name))
}

function hCloseIr(key: string, name?: string) {
  return h(Comment, closeIrTag(key, name))
}

function openIrTag(type: string, key: string, name?: string) {
  let tag = `tst:${type}:${key}`

  if (name) {
    tag += `:${name}`
  }

  return tag
}

function closeIrTag(key: string, name?: string) {
  let tag = `/tst:${key}`

  if (name) {
    tag += `:${name}`
  }

  return tag
}
</script>

<template>
  <render-template />
</template>
