<script setup lang="ts">
import {
  onMounted,
  h,
  shallowRef,
  createCommentVNode,
  watch,
  useTemplateRef,
  ref,
  nextTick,
} from 'vue'
import type {
  TransientComponentDictionnary,
  TransientElement,
  TransientTemplate,
} from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents, useDictionnary } from '@/lib/use-dictionnary'
import { createTextElement, findElementById, hasTextChildren } from 'transient/src/transient/ast'
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

function render(element: TransientElement, context?: { slot: { name: string; ownerId: string } }) {
  if (element.tag === '#text') {
    return [
      createCommentVNode(`#text data-transient-id=${element.id}`, true),
      element.attributes?.value?.expression,
    ]
  }

  const isComponent = element.isComponent
  const tag = element.tag

  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
    ),
    // allow focusin to edit
    tabIndex: isComponent ? 0 : undefined,
  }

  const slots: Record<string, () => any> = {}
  const component = useDictionnary().get(tag)

  if ((isComponent && component?.slots) || (!isComponent && element.slots)) {
    for (const slot in component?.slots ?? element.slots) {
      const content = element?.slots?.[slot]

      if (content) {
        const rendered = (content ?? []).map((child, i) =>
          render(
            child,
            i === 0 && isComponent
              ? {
                  slot: {
                    name: slot,
                    ownerId: element.id,
                  },
                }
              : undefined,
          ),
        )
        slots[slot] = () => rendered
      } else if (isComponent) {
        slots[slot] = () =>
          render(
            {
              id: crypto.randomUUID(),
              attributes: {},
              isComponent: false,
              tag: 'div',
              slots: {
                default: [createTextElement(slot)],
              },
            },
            {
              slot: {
                name: slot,
                ownerId: element.id,
              },
            },
          )
      }
    }
  }

  const meta: Record<string, any> = {}

  const listeners: Record<string, (e: Event) => void> = {}

  return h(
    Component,
    {
      ...attrs,
      ...meta,
      ...listeners,
      contenteditable: hasTextChildren(element) ? true : null,
      'data-transient-id': element.id,
      onVnodeMounted(vnode) {
        if (context?.slot) {
          const el = vnode.el as HTMLElement
          const parent = el.parentElement
          if (parent) {
            parent.contentEditable = 'true'
            parent.textContent = context.slot.name
            parent.dataset.transientSlot = `${context.slot.name}:${context.slot.ownerId}`
            parent.tabIndex = 0
          }
        }
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

function createTemporaryNode(callback: (el: HTMLElement) => void) {
  return h('div', {
    style: { display: 'none' }, // or use `visibility: hidden` if needed
    onVnodeMounted(vnode) {
      const el = vnode.el as HTMLElement
      const parent = el.parentElement
      if (parent) {
        callback(parent)
      }

      // Remove self after next tick
      nextTick(() => {
        el.remove()
      })
    },
  })
}
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
