<script setup lang="ts">
import { onMounted, shallowRef, computed, type Directive } from 'vue'
import type { TransientElement } from 'transient'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
import { isTextZone } from 'transient'
import SlotSpy from './SlotSpy.vue'
import type { ComponentSlotEditionInput, Edition, ElementEditionInput } from '@/editor/edition'
import { assertIs, assertIsDefined, someHTMLElement } from 'transient'
import TComment from './TComment.vue'
import { getTransientID } from 'transient'

const props = defineProps<{
  element: TransientElement
  dictionnary: ComponentDictionnary
  slotLocation?: { slotName: string; ownerId: string }
}>()
const components = shallowRef<Record<string, unknown>>({})
const slotNames = computed(() => {
  const slots = props.dictionnary.get(props.element.tag)?.slots
  return slots ? Object.keys(slots) : ['default']
})

const emit = defineEmits<{ select: [node: HTMLElement | null]; edit: [edition: Edition] }>()

onMounted(async () => {
  components.value = await loadAllComponents()
})

const attributes = computed<Record<string, unknown>>(() => {
  return {
    ...Object.fromEntries(
      Object.entries(props.element.attributes || {}).map(([k, v]) => [k, v.expression]),
    ),
    tabIndex: props.element.isComponent ? 0 : undefined,
    'data-transient-id': props.element.id,
    'data-transient-editable': true,
    'data-transient-component': props.element.isComponent ? props.element.tag : undefined,
  }
})

const vEdit: Directive<HTMLElement, ComponentSlotEditionInput | ElementEditionInput> = {
  mounted: (el: HTMLElement) => {
    el.addEventListener('focusin', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      emit('select', event.target)
    })
    el.addEventListener('focusout', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      const target = event.target

      const transientSlot = target.dataset.transientSlot

      // Standard editable element case
      if (target.dataset.transientEditable === 'true') {
        const transientID = getTransientID(target)
        assertIsDefined(transientID)
        emit('edit', {
          type: 'edit-element',
          node: target,
          transientId: transientID,
        })
      } else if (transientSlot) {
        // Clean up visual "emptiness" in slot zones
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
      }

      emit('select', null)
    })
  },
}
</script>
<template>
  <component
    v-if="element.tag !== '#text'"
    :is="element.isComponent ? components[element.tag] : element.tag"
    v-bind="attributes"
    v-edit
  >
    <template v-for="slotName in slotNames">
      <SlotSpy
        v-if="isTextZone(element, slotName)"
        :slot-name="slotName"
        :owner-id="element.id"
        :key="slotName"
        :editable="!attributes['data-text-addition']"
      />
      <template v-if="element.slots">
        <TransientBuilder
          v-for="child in element.slots[slotName]"
          :dictionnary="dictionnary"
          :element="child"
          :key="JSON.stringify(child)"
          :slot-location="{ slotName, ownerId: element.id }"
          @edit="(event) => emit('edit', event)"
          @select="(event) => emit('select', event)"
        />
      </template>
    </template>
  </component>
  <template v-else>
    <TComment :content="`#text data-transient-id=${element.id}`" />
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
