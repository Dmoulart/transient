<script setup lang="ts">
import { type ComponentDictionnary } from '@/lib/composables/use-dictionnary'
import { type Index, useIndex } from '@/lib/composables/use-index'
import { assert, assertIsDefined, type TransientElement, type TransientTemplate } from 'transient'
import { h, Text, type VNode } from 'vue'
import EditableRoot from './EditableRoot.vue'
import { parseElementAttributes } from '@/lib/transient/attributes.ts'
import type { EditorEvents } from '@/editor/events.ts'

const props = defineProps<{
  template: TransientTemplate
  dictionnary: ComponentDictionnary
  components: Record<string, unknown>
  editing?: { id: string; point: { x: number; y: number } } | null
}>()

const emit = defineEmits<EditorEvents & { exitEditing: [] }>()

const index = defineModel<Index>({ default: () => useIndex() })

const renderTemplate = () => {
  index.value.elements.clear()
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

  const slots = Object.fromEntries(
    Object.entries(element.slots ?? {}).map(([slotName, children]) => [
      slotName,
      () => render(children),
    ]),
  )

  const attributes = parseElementAttributes(element)

  const componentVnode = h(component, attributes, slots)
  index.value.elements.set(element.id, componentVnode)
  // freeze
  // componentVnode.shapeFlag = 1 << 3
  return [componentVnode]
}

function renderElement(element: TransientElement) {
  assert(!element.isComponent)

  if (element.tag === '#text') {
    const text = renderText(element)
    return [text]
  }

  if (props.editing?.id === element.id) {
    const editableRootVnode = h(EditableRoot, {
      element,
      mouse: props.editing.point,
      renderComponent,
      onEdit: (e) => emit('edit', e),
      onExitEditing: () => emit('exitEditing'),
    })

    index.value.elements.set(element.id, editableRootVnode)
    return [editableRootVnode]
  }
  const attributes = parseElementAttributes(element)

  const children: VNode[] = []
  //missing slots
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
</script>

<template>
  <render-template />
</template>
