<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode, watch, useTemplateRef, ref } from 'vue'
import type {
  TransientComponentDictionnary,
  TransientElement,
  TransientTemplate,
} from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
import {
  findElementById,
  findSlots,
  groupElementsBySlot,
  hasTextChildren,
  substituteSlots,
} from 'transient/src/transient/ast'
import { assertIs, someHTMLElement } from 'transient/src/core/assert'
import type { TransientComponentSchema } from 'transient/src'
import { getTransientID } from 'transient/src/analyzers/html/html'

const props = defineProps<{
  template: TransientTemplate
  dictionnary: ComponentDictionnary
}>()

const loadedComponents = shallowRef<Record<string, any>>({})

onMounted(async () => {
  loadedComponents.value = await loadAllComponents()
})

function render(element: TransientElement) {
  if (element.tag === '#text') {
    return [
      createCommentVNode(`#text data-transient-id=${element.id}`, true),
      element.attributes?.value?.expression,
    ]
  }

  const isComponent = element.isComponent
  const tag = element.tag
  // if (isComponent) {
  //   const schema = getTransientComponentSchemaByTag(tag)
  //   console.log({ schema })
  // }
  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
    ),
    // allow focusin to edit
    tabIndex: isComponent ? 0 : undefined,
  }

  const elementSlots: Record<string, TransientElement[]> = {}
  for (const [name, content] of Object.entries(groupElementsBySlot(element.children ?? []))) {
    elementSlots[name] = substituteSlots(content, (slotName, slot) => {
      return {
        tag: 'ui-slot',
        isComponent: false,
        id: crypto.randomUUID(),
        children: [
          {
            id: crypto.randomUUID(),
            isComponent: false,
            tag: '#text',
            attributes: {
              value: {
                type: 'literal',
                expression: `SLOT ${slotName}!`,
              },
            },
          } as TransientElement,
        ],
        attributes: {
          'data-transient-slot': {
            type: 'literal',
            expression: slotName,
          },
        },
      } as TransientElement
    })
  }

  const slots: Record<string, () => any> = {}
  for (const [name, content] of Object.entries(elementSlots)) {
    const rendered = content.map(render)
    slots[name] = () => rendered
  }

  const meta: Record<string, any> = {}

  const listeners: Record<string, (e: Event) => void> = {}

  return h(
    Component,
    {
      ...attrs,
      ...meta,
      ...listeners,
      // 'data-transient-editable': isElementEditable(element),
      // 'data-transient-text-editable': hasTextChildren(element),
      contenteditable: hasTextChildren(element) ? true : null,
      'data-transient-id': element.id,
      onVnodeMounted(vnode) {
        const el = vnode.el
        assertIs(someHTMLElement, el)

        const slots = el.querySelectorAll('slot')
        slots.forEach((slotEl) => {
          const name = slotEl.getAttribute('name') || 'default'
          console.log(`Slot found in component ${element.tag}:`, name, slotEl)
        })
      },
    },
    slots,
  )
}
const root = ref<HTMLElement | null>()

onMounted(() => {
  document.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('[data-transient-id]')
    // console.log(selection)

    if (item && item instanceof HTMLElement) {
      const id = item.dataset.transientId
      if (id) {
        const matching = findElementById(props.template.elements ?? [], id)
      }
    }
  })
})
</script>

<template>
  <component
    ref="root"
    v-if="loadedComponents"
    v-for="el in props.template.elements || []"
    :is="render(el)"
  />
  <div v-else>Loading...</div>
</template>
<style>
/* [data-transient-editable='true']:hover {
  background-color: pink;
  min-height: 20px;
  width: 100%;
} */
</style>
