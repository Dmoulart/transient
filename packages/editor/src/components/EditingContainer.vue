<script setup lang="ts">
import type { Node as PmNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/vue-3'
import { getDescendantComponents, type TransientElement } from '@transient/ir'
import {
  type ComponentInternalInstance,
  type EffectScope,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  Teleport,
  type VNode,
} from 'vue'
import type { SlotLocation } from '@/lib/composables/use-index'
import { editableRoots } from '@/lib/edition/editable-root'
import type { EditorEvents } from '@/lib/edition/events.ts'
import { extensions } from '@/lib/edition/extensions'
import {
  hasBlocks,
  pmContentToTransientElements,
  transientElementsToPmContent,
} from '@/lib/edition/richtext'
import { borrow, canBorrow, type Surroundings } from '@/lib/edition/surroundings'
import { parseElementAttributes } from '@/lib/transient/attributes'
import RichTextToolbar from './RichTextToolbar.vue'

const props = defineProps<{
  // the element to edit, or a stand-in holding a slot's content (see `locate`)
  container: TransientElement
  renderComponent: (element: TransientElement) => VNode
  render: (elements: TransientElement[]) => VNode[]
  mouse: { x: number; y: number }
  owner: TransientElement
  slotName: string
  // which copy of a repeated slot is editable; the others render normally
  occurrence?: number
  // a component's slot: where it is rendered. The editor mounts on the element holding the
  // slot, and `container` is only rendered when that element can't be borrowed
  locate?: () => SlotLocation | undefined
}>()

const emit = defineEmits<
  EditorEvents & {
    exitEditing: []
    islandsMounted: [{ editor: Editor; islands: Map<string, VNode> }]
  }
>()

const instance = getCurrentInstance()!
const content = props.container.slots?.[props.slotName] ?? []

const rootKey = `${props.owner.id}:${props.slotName}`
// setup runs once per copy, in render order: the count gives this copy's position
const position = editableRoots.get(rootKey) ?? 0
editableRoots.set(rootKey, position + 1)

onUnmounted(() => {
  editableRoots.set(rootKey, editableRoots.get(rootKey)! - 1)
})

const Root = position === (props.occurrence ?? 0) ? editable() : () => props.render(content)

function editable() {
  const placeholders = new Map<string, HTMLElement>()
  // the component vnodes go to the index (it needs `.component`), the Teleports to the render
  const islands = new Map<string, VNode>()
  const teleports: VNode[] = []

  for (const child of getDescendantComponents(props.container)) {
    const placeholder = document.createElement('tst-island')
    placeholder.contentEditable = 'false'
    placeholders.set(child.id, placeholder)

    const vnode = props.renderComponent(child)
    islands.set(child.id, vnode)
    teleports.push(h(Teleport, { to: placeholder }, vnode))
  }

  const editor = shallowRef<Editor>()
  // a slot first tries the element that holds it (once mounted: that takes the DOM)
  const ownElement = ref(!props.locate)
  let surroundings: Surroundings | undefined
  let frozen: ComponentInternalInstance[] = []
  // the document as the IR has it: leaving it as is isn't an edit
  let saved: PmNode | undefined

  onMounted(() => {
    if (ownElement.value) return

    const start = instance.subTree.el as Node
    const parent = start.parentNode
    const slot = props.locate!()

    // inside the component only: what the component itself sits next to isn't ours to lend
    if (!slot || !parent || slot.container[0] !== parent || !canBorrow(parent)) {
      ownElement.value = true
      return
    }

    surroundings = borrow(parent, start)
    // a re-render would patch nodes ProseMirror now holds: it waits until they are given back
    frozen = slot.renderers
    for (const renderer of frozen) scopeOf(renderer).pause()
    open(parent)
  })

  // before Vue takes the slot's nodes out: they must be back where it left them
  onBeforeUnmount(() => {
    commit()
    editor.value?.destroy()
    surroundings?.giveBack()
    for (const renderer of frozen) scopeOf(renderer).resume()
  })

  function open(mount: HTMLElement) {
    const blocks = hasBlocks(content, placeholders)
    // read before ProseMirror changes it: islands and surroundings are not `pre-wrap`
    mount.style.setProperty('--tst-white-space', getComputedStyle(mount).whiteSpace)

    editor.value = new Editor({
      // on the element itself, not in a <div> appended to it
      element: { mount },
      // Tiptap's sheet restyles the text it edits (see <style>)
      injectCSS: false,
      extensions: extensions({ blocks, placeholders, surroundings }),
      content: transientElementsToPmContent(content, placeholders),
      autofocus: false,
      enableContentCheck: true,
      editorProps: {
        attributes: ({ doc }) => ({
          'data-test': 'editing-container',
          'data-edition': 'replace-slot-content',
          ...(blocks && { 'data-blocks': '' }),
          ...(!doc.content.size && { 'data-empty': '' }),
        }),
      },
      onMount({ editor }) {
        const caret = editor.view.posAtCoords({ left: props.mouse.x, top: props.mouse.y })

        // focus, then the caret: Tiptap's focus(position) does it the other way round, a
        // frame apart, and Chrome then types at the start of a text whose end was clicked
        editor.view.focus()
        if (caret) editor.commands.setTextSelection(caret.pos)
        // callbacks are typed with the core Editor, but this instance is the Vue one
        emit('islandsMounted', { editor: editor as Editor, islands })
      },
      onBlur() {
        commit()
        emit('exitEditing')
      },
    })
    saved = editor.value.state.doc
  }

  // on blur, or when editing stops without one (a click on a sibling the editor holds)
  function commit() {
    const doc = editor.value?.state.doc
    if (!doc || !saved || doc.eq(saved)) return
    saved = doc

    emit('edit', {
      type: 'replace-slot-content',
      element: props.owner,
      slotName: props.slotName,
      content: pmContentToTransientElements(doc.toJSON(), props.container),
    })
  }

  // nothing Vue renders later (the toolbar) may land among the nodes ProseMirror holds
  const offstage = document.createElement('div')

  return () => [
    ownElement.value
      ? h(props.container.tag, {
          ...parseElementAttributes(props.container),
          // Vue renders the tag and leaves its children alone: ProseMirror owns them
          onVnodeMounted: (vnode) => open(vnode.el as HTMLElement),
        })
      : null,
    h(Teleport, { to: offstage }, [
      ...teleports,
      editor.value && h(RichTextToolbar, { editor: editor.value }),
    ]),
  ]
}

// @internal in Vue's types
function scopeOf(instance: ComponentInternalInstance) {
  return (instance as ComponentInternalInstance & { scope: EffectScope }).scope
}
</script>
<template
  ><Root /></template
>
<style>
/* What ProseMirror needs to edit, and nothing that restyles the text: Tiptap's own sheet
   also turns ligatures off and makes the element position: relative */
.ProseMirror {
  white-space: pre-wrap;
  outline: none;
}

/* what isn't edited keeps the white-space the element had (see open()) */
.ProseMirror [contenteditable="false"] {
  white-space: var(--tst-white-space, normal);
}

/* the browser's sheet gives an editable element `overflow-wrap: break-word` and a
   line-break rule, which everything in it inherits: back to what the page says.
   :where() has no specificity, a rule of the page on that element still wins */
:where(.ProseMirror) {
  overflow-wrap: inherit;
  line-break: inherit;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* a selected island shows its own outline, not the native selection */
.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}

/* ProseMirror ends a line of text with a <br> unless a text node does: always the case
   next to the slot's surroundings, or after an island. Only an empty slot needs it, to
   hold the caret */
:is(br, tst-island) ~ br.ProseMirror-trailingBreak,
.ProseMirror:not([data-empty]) > br.ProseMirror-trailingBreak {
  display: none;
}

/* except after a <br> that ends the text: it holds the new, empty line (Enter at the end) */
.ProseMirror br:not(.ProseMirror-trailingBreak) + br.ProseMirror-trailingBreak {
  display: inline;
}

/* the fallback wrapper is a custom element, so inline: <h2>, <p> inside need a block parent.
   Not display: contents, the editing host would lose focus. The wrapper takes the
   blocks' place as grid/flex item, so their own z-index stops applying: keep the
   edited text above the component's decorative layers (a hero's background) */
tst-slot-edition[data-blocks] {
  display: block;
  position: relative;
  z-index: 1;
}

tst-island:has(> :not(a, span, b, i, strong, em, img, svg)) {
  display: block;
}

:has(> tst-island > :not(a, span, b, i, strong, em, img, svg)) > img.ProseMirror-separator {
  display: none !important;
}
</style>
