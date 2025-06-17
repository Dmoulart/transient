<template>
  <RichTextEditor :node="editedNode" class="text-editor" />

  <Suspense>
    <TransientBuilder
      :key="forceRerender"
      v-if="contents"
      :template="contents"
      :registry="registry"
    />
  </Suspense>

  <JsonViewer
    v-if="contents"
    :value="contents"
    copyable
    boxed
    sort
    expanded
    :expanded-depth="4"
    theme="dark"
  />

  <Button @click="saveToLocalStorage">Save</Button>
  <Button @click="loadFromLocalStorage">Load</Button>
  <div id="app">
    QUILL
    <quill-editor theme="snow"></quill-editor>
  </div>
</template>

<script setup lang="ts">
import RichText from '@/PageEditor/RichText.vue'
import { getTransientComponentSchema, registry } from '@/lib/use-dictionnary'
// @ts-expect-error : oups no types
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import TransientBuilder from './TransientBuilder.vue'
import Button from '@/samples/Button.vue'
import { usePage } from '@/lib/use-page'
import { useEditedNode, useEdition } from '@/lib/use-edition'
import {
  createApp,
  ref,
  shallowRef,
  triggerRef,
  watch,
  type App,
  type Ref,
  type ShallowRef,
} from 'vue'
// import { Editor, EditorContent, useEditor } from '@tiptap/vue-3'
// import Color from '@tiptap/extension-color'
// import ListItem from '@tiptap/extension-list-item'
// import TextStyle from '@tiptap/extension-text-style'
// import StarterKit from '@tiptap/starter-kit'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import RichTextEditor from './RichTextEditor.vue'

const component = getTransientComponentSchema(
  '/Users/dorianmoulart/Documents/code/study/cms-make/bridge/packages/editor/src/samples/HomePage.vue',
)

const { contents, replace, render, patch, saveToLocalStorage, loadFromLocalStorage } = usePage(
  component.template!,
)

const forceRerender = ref(0)

const { onEditStart, onEditEnd } = useEdition()
const editedNode = useEditedNode()
onEditEnd((element) => {
  // patch(element)
  console.log({ replaceElement: element })
  replace(element)
  render()
  forceRerender.value++
})

// let richText: App<Element> | null = null
// let richTextContent: App<Element> | null = null

// watch(useEditedNode(), (newNode, oldNode) => {
//   // Unmount previous instance if there was any
//   if (richText) {
//     richText.unmount()
//     richText = null
//     richTextContent?.unmount()
//     richTextContent = null
//   }

//   if (newNode) {
//     const editor = new Editor({
//       extensions: [
//         Color.configure({ types: [TextStyle.name, ListItem.name] }),
//         TextStyle.configure({ types: [ListItem.name] }),
//         StarterKit,
//       ],

//       content: newNode.innerHTML,
//     })
//     console.log('editor', editor)
//     // Mount RichText into this newNode
//     richText = createApp(RichText, { editor: editor })
//     richText.mount('#richtext-editor')

//     richTextContent = createApp(EditorContent, { editor: editor })
//     const component = richTextContent.mount(newNode as Element)
//     const el: HTMLElement = component.$el
//     // console.log({ el })
//     // el.setAttribute('data-transient-ignore', null)
//   }
// })
</script>

<style scoped>
.text-editor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
