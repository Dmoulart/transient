<script setup lang="ts">
import { onMounted, shallowRef, computed, type Directive } from 'vue'
import type { TransientElement } from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
import { hasTextChildren } from 'transient/src/transient/ast'
import SlotSpy from './SlotSpy.vue'
import type { ComponentSlotEditionInput, Edition, ElementEditionInput } from '@/editor/edition'
import { useEditedNode } from '@/lib/use-edition'
import { assertIs, someHTMLElement } from 'transient/src/core/assert'

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
    contenteditable: hasTextChildren(props.element) ? true : null,
    'data-transient-id': props.element.id,
  }
  if (props.slotLocation) {
    attributes['data-transient-slot'] =
      `${props.slotLocation.slotName}:${props.slotLocation.ownerId}`
  }
  return attributes
})

const vEdit: Directive<HTMLElement, ComponentSlotEditionInput | ElementEditionInput> = {
  mounted: (el: HTMLElement, binding) => {
    el.addEventListener('focusin', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      useEditedNode().value = event.target
      // emit('edit', binding.value)
    })

    el.addEventListener('focusout', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      emit('edit', { ...binding.value, node: event.target })
      useEditedNode().value = undefined
    })
  },
}
</script>
<template>
  <template v-if="element.tag === '#text'">
    {{ element.attributes?.value?.expression }}
  </template>
  <component
    v-else
    :is="element.isComponent ? components[element.tag] : element.tag"
    v-bind="attributes"
    v-edit="
      slotLocation
        ? {
            type: 'component-slot',
            ownerId: slotLocation.ownerId,
            slotName: slotLocation.slotName,
          }
        : {
            type: 'element',
            transientId: element.id,
          }
    "
  >
    <template v-if="slotNames" v-for="slotName in slotNames">
      <SlotSpy v-if="element.isComponent" :slot-name="slotName" :owner-id="element.id" />
      <TransientBuilder2
        v-if="element?.slots?.[slotName]"
        v-for="element in element.slots[slotName]"
        :dictionnary="dictionnary"
        :element="element"
        :slot-location="element.isComponent ? { slotName, ownerId: element.id } : undefined"
        @edit="(event) => emit('edit', event)"
      />
      <div v-else data-transient-placeholder>
        {{ slotName }}
      </div>
    </template>
  </component>
</template>
