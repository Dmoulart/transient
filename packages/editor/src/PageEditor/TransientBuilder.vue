<script setup lang="ts">
import { onMounted, h, shallowRef, createCommentVNode, watch, useTemplateRef, ref } from 'vue'
import type {
  TransientComponentDictionnary,
  TransientElement,
  TransientTemplate,
} from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
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

  const slots: Record<string, () => any> = {}

  const rendered = (element.children ?? []).map(render)
  slots.default = () => rendered

  const meta: Record<string, any> = {}
  // for (const [key, value] of Object.entries(element.attributes)) {
  //   meta[`data-transient-attr-${key}`] = JSON.stringify(value)
  // }

  const listeners: Record<string, (e: Event) => void> = {}

  // if (isElementEditable(element)) {
  //   listeners.selectionchange = detectElementEdition
  // }

  return h(
    Component,
    {
      ...attrs,
      ...meta,
      ...listeners,
      // 'data-transient-editable': isElementEditable(element),
      // 'data-transient-text-editable': hasTextChildren(element),
      contenteditable:
        element.hasSlot || (element.isComponent === false && hasTextChildren(element))
          ? true
          : null,
      'data-transient-id': element.id,
      onVnodeMounted(vnode) {
        const el = vnode.el
        console.log({ el })
        debugger
        assertIs(someHTMLElement, el)

        const schema = props.dictionnary.get(tag)

        if (schema?.slots) {
          Object.entries(schema.slots).forEach(([name, { parentId }]) => {
            const parentSlot = el.querySelector(`[data-transient-id="${parentId}"]`)
            if (parentSlot) {
              assertIs(someHTMLElement, parentSlot)
              parentSlot.contentEditable = 'true'
              console.log('gooo')
            }
          })
        }
        // if (props.schema.slots) {
        //   for (const [slotName, { parentId }] of Object.entries(props.schema.slots)) {
        //     const slotParent = el.querySelector(`[data-transient-id="${parentId}"]`)
        //     console.log({ slotParent })
        //   }
        // }
        // el.quer
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
