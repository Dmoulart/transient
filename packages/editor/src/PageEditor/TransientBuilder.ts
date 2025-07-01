import { defineComponent, h, onMounted, shallowRef, createCommentVNode, ref, nextTick } from 'vue'
import type { TransientElement, TransientTemplate } from 'transient/src/transient/definition'
import { ComponentDictionnary, loadAllComponents, useDictionnary } from '@/lib/use-dictionnary'
import { createTextElement, findElementById, hasTextChildren } from 'transient/src/transient/ast'

export default defineComponent({
  name: 'TransientRenderer',
  props: {
    template: {
      type: Object as () => TransientTemplate,
      required: true,
    },
    dictionnary: {
      type: Object as () => ComponentDictionnary,
      required: true,
    },
  },
  setup(props) {
    const loadedComponents = shallowRef<Record<string, any>>({})
    const root = ref<HTMLElement | null>(null)

    onMounted(async () => {
      loadedComponents.value = await loadAllComponents()
    })

    onMounted(() => {
      document.addEventListener('click', (e) => {
        const item = (e.target as HTMLElement).closest('[data-transient-id]')
        if (item && item instanceof HTMLElement) {
          const id = item.dataset.transientId
          if (id) {
            findElementById(props.template.elements ?? [], id)
          }
        }
      })
    })

    function render(
      element: TransientElement,
      context?: { slot: { name: string; ownerId: string } },
    ): any {
      if (element.tag === '#text') {
        // return element.attributes?.value?.expression ?? ''
        return [
          createCommentVNode(`#text data-transient-id=${element.id}`, true),
          element.attributes?.value?.expression ?? '',
        ]
      }

      const isComponent = element.isComponent
      const tag = element.tag
      const Component = isComponent ? loadedComponents.value[tag] : tag

      const attrs = {
        ...Object.fromEntries(
          Object.entries(element.attributes || {}).map(([k, v]) => [k, v.expression]),
        ),
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

      return h(
        Component,
        {
          ...attrs,
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

    function createTemporaryNode(callback: (el: HTMLElement) => void) {
      return h('div', {
        style: { display: 'none' },
        onVnodeMounted(vnode) {
          const el = vnode.el as HTMLElement
          const parent = el.parentElement
          if (parent) {
            callback(parent)
          }
          nextTick(() => {
            el.remove()
          })
        },
      })
    }

    return () => {
      if (!loadedComponents.value) {
        return h('div', 'Loading...')
      }

      return (props.template.elements || []).map((el) => render(el))
    }
  },
})
