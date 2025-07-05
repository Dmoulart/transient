<script setup lang="ts">
import { onMounted, shallowRef, computed, type Directive, watch, ref, onUpdated } from 'vue'
import type { TransientElement } from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents } from '@/lib/use-dictionnary'
import { hasTextChildren } from 'transient/src/transient/ast'
import SlotSpy from './SlotSpy.vue'
import type { ComponentSlotEditionInput, Edition, ElementEditionInput } from '@/editor/edition'
import { useEditedNode } from '@/lib/use-edition'
import { assertIs, assertIsDefined, someHTMLElement } from 'transient/src/core/assert'
import Comment from './Comment.vue'

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
  // if (props.slotLocation) {
  //   attributes['data-transient-slot'] =
  //     `${props.slotLocation.slotName}:${props.slotLocation.ownerId}`
  // }
  return attributes
})

// onUpdated(() => {
//   console.log(props.element.tag, 'updated', props.element)
// })

// watch(props.element, (newEl, oldEl) => {
//   console.log('changes', { newEl, oldEl })
//   // counter.value++
// })

const vEdit: Directive<HTMLElement, ComponentSlotEditionInput | ElementEditionInput> = {
  mounted: (el: HTMLElement, binding) => {
    el.addEventListener('focusin', (event) => {
      event.stopPropagation()
      assertIs(someHTMLElement, event.target)
      useEditedNode().value = event.target
    })

    el.addEventListener('focusout', (event) => {
      event.stopPropagation()

      assertIs(someHTMLElement, event.target)

      let transientSlot = undefined
      for (const node of event.target.childNodes) {
        if (
          node.nodeType === Node.COMMENT_NODE &&
          node.textContent?.startsWith('transient-slot=')
        ) {
          transientSlot = node.textContent?.substring('transient-slot='.length)
          break
        }
      }

      assertIsDefined(transientSlot)

      const [slotName, ownerId] = transientSlot.split(':')

      emit('edit', {
        type: 'edit-component-slot',
        slotName: slotName,
        ownerId: ownerId,
        node: event.target,
      })
      useEditedNode().value = undefined
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
    @click.stop="
      () => {
        console.log({ element })
      }
    "
  >
    <template v-if="slotNames" v-for="slotName in slotNames">
      <SlotSpy v-if="element.isComponent" :slot-name="slotName" :owner-id="element.id" />
      <Comment :content="`transient-slot=${slotName}:${element.id}`" />
      <TransientBuilder
        v-if="element?.slots?.[slotName]"
        v-for="child in element.slots[slotName]"
        :dictionnary="dictionnary"
        :element="child"
        :slot-location="{ slotName, ownerId: element.id }"
        @edit="(event) => emit('edit', event)"
      />
      <div v-else data-transient-placeholder>
        {{ slotName }}
      </div>
    </template>
  </component>
  <template v-else>
    <Comment :content="`#text data-transient-id=${element.id}`" />
    {{ element.attributes?.value?.expression }}
  </template>
</template>
