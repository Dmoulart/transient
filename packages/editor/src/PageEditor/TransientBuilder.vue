<script setup lang="ts">
import { onMounted, shallowRef, computed, type Directive, watch, ref, onUpdated } from 'vue'
import type { TransientElement } from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
import { isTextZone } from 'transient/src/transient/ast'
import SlotSpy from './SlotSpy.vue'
import type { ComponentSlotEditionInput, Edition, ElementEditionInput } from '@/editor/edition'
import { useEditedNode } from '@/lib/use-edition'
import { assertIs, assertIsDefined, someHTMLElement } from 'transient/src/core/assert'
import Comment from './Comment.vue'
import { getTransientID } from 'transient/src/analyzers/html/html'

const props = defineProps<{
  element: TransientElement
  dictionnary: ComponentDictionnary
  slotLocation?: { slotName: string; ownerId: string }
}>()
const components = shallowRef<Record<string, any>>({})
const slotNames = computed(() => {
  const slots = props.dictionnary.get(props.element.tag)?.slots
  return slots ? Object.keys(slots) : ['default']
})

const emit = defineEmits<{ edit: [edition: Edition] }>()

onMounted(async () => {
  components.value = await loadAllComponents()
})

const attributes = computed(() => {
  const attributes: Record<string, any> = {
    ...Object.fromEntries(
      Object.entries(props.element.attributes || {}).map(([k, v]) => [k, v.expression]),
    ),
    tabIndex: props.element.isComponent ? 0 : undefined,
    'data-transient-id': props.element.id,
    'data-transient-editable': true,
    'data-transient-component': props.element.isComponent ? props.element.tag : undefined,
  }

  return attributes
})

const vEdit: Directive<HTMLElement, ComponentSlotEditionInput | ElementEditionInput> = {
  mounted: (el: HTMLElement, binding) => {
    el.addEventListener('focusin', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      useEditedNode().value = event.target
    })

    el.addEventListener('focusout', (event) => {
      event.stopPropagation()
      try {
        assertIs(someHTMLElement, event.target)

        const target = event.target

        const transientSlot = target.dataset.transientSlot

        // Clean up visual "emptiness" in slot zones
        if (transientSlot) {
          // Remove redundant <br> and empty text nodes
          const onlyGarbage = Array.from(target.childNodes).every((node) => {
            return (
              (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR') ||
              (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '')
            )
          })

          if (onlyGarbage) {
            target.innerHTML = ''
            target.dataset.textAddition = 'true'
          }

          const [slotName, ownerId] = transientSlot.split(':')
          emit('edit', {
            type: 'edit-slot',
            slotName,
            ownerId,
            node: target,
          })
          useEditedNode().value = undefined
          return
        }

        // Standard editable element case
        if (target.dataset.transientEditable === 'true') {
          const transientID = getTransientID(target)
          assertIsDefined(transientID)
          emit('edit', {
            type: 'edit-element',
            node: target,
            transientId: transientID,
          })
          useEditedNode().value = undefined
          return
        }

        useEditedNode().value = undefined
      } catch (e) {
        debugger
      }
    })
  },
}

const withoutKeys = <T extends Record<string, any>>(object: T, keysToRemove: (keyof T)[]) => {
  const filteredObject = { ...object }
  for (const key of keysToRemove) {
    delete filteredObject[key]
  }

  return filteredObject
}
</script>
<template>
  <component
    v-if="element.tag !== '#text'"
    :is="element.isComponent ? components[element.tag] : element.tag"
    v-bind="attributes"
    v-edit
  >
    <template v-if="slotNames" v-for="slotName in slotNames">
      <SlotSpy
        v-if="isTextZone(element, slotName)"
        :slot-name="slotName"
        :owner-id="element.id"
        :editable="!attributes['data-text-addition']"
      />
      <TransientBuilder
        v-if="element?.slots?.[slotName]"
        v-for="child in element.slots[slotName]"
        :dictionnary="dictionnary"
        :element="child"
        :key="JSON.stringify(child)"
        :slot-location="{ slotName, ownerId: element.id }"
        @edit="(event) => emit('edit', event)"
      />
    </template>
  </component>
  <template v-else>
    <Comment :content="`#text data-transient-id=${element.id}`" />
    {{ element.attributes?.value?.expression }}
  </template>
</template>
<style>
[data-transient-slot]:not([data-text-addition]):empty::before {
  content: attr(data-transient-slot); /* or a fixed label like "Click to edit" */
  color: #aaa;
  font-style: italic;
  pointer-events: none;
  display: inline-block;
}
[data-transient-slot]:focus::before {
  content: none;
}
[data-transient-slot] {
  min-height: 1.2em; /* ensures visibility even when empty */
  position: relative;
  cursor: text;
}
</style>
