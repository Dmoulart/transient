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
import { findElementById, hasTextChildren } from 'transient/src/transient/ast'
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

  const Component = isComponent ? loadedComponents.value[tag] || tag : tag

  const attrs = {
    ...Object.fromEntries(
      Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
    ),
    // allow focusin to edit
    tabIndex: isComponent ? 0 : undefined,
  }

  const slots: Record<string, () => any> = {}
  for (const [name, content] of Object.entries(element.slots ?? {})) {
    const rendered = content.map(render)

    slots[name] = () => rendered
  }

  if (isComponent) {
    const component = useDictionnary().get(tag)
    if (component.slots) {
      for (const slot of Object.keys(component.slots)) {
        if (!element.slots?.[slot]) {
          slots[slot] = () =>
            createTemporaryNode((parent) => {
              parent.contentEditable = 'true'
              parent.textContent = slot
              parent.dataset.transientSlot = `${slot}:${element.id}`
              parent.tabIndex = 0
            })
        }
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
