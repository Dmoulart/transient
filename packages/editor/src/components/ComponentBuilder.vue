<script setup lang="ts">
import { assert } from "@transient/core"
import type { TransientComponentDictionnary, TransientElement, TransientTemplate } from "@transient/ir"
import { h, onErrorCaptured, resolveComponent as resolveVueComponent, Text, type VNode } from "vue";
import type { EditorEvents } from "@/editor/events.ts";
import type { ResolveComponent } from "@/lib/components.ts";
import type { Editing } from "@/lib/composables/use-editor.ts";
import { type Index, useIndex } from "@/lib/composables/use-index";
import { parseElementAttributes } from "@/lib/transient/attributes.ts";
import EditingContainer from "./EditingContainer.vue";

const props = defineProps<{
  template: TransientTemplate;
  dictionnary: TransientComponentDictionnary;
  resolveComponent?: ResolveComponent
  editing?: Editing | null;
}>();

onErrorCaptured((e) => {
  console.error(e);
});
const emit = defineEmits<EditorEvents & { exitEditing: [] }>();

const index = defineModel<Index>({ default: () => useIndex() });

const RenderTemplate = () => {
  index.value.elements.clear();
  const vnodes: VNode[] = [];

  vnodes.push(...render(props.template.elements));

  return vnodes;
};

function render(elements: TransientElement[]) {
  const vnodes: VNode[] = [];
  for (const element of elements) {
    if (element.isComponent) {
      vnodes.push(...renderComponent(element));
    } else {
      vnodes.push(...renderElement(element));
    }
  }
  return vnodes;
}

function nameSlot(slotName: string, renderSlot: () => VNode[] | VNode) {
  return (props?: { key: unknown }) => {
    if (props?.key) {
      props.key = `_${slotName}__!__${String(props.key)}`;
    }
    return renderSlot();
  };
}

function renderComponent(element: TransientElement): VNode[] {
  assert(element.isComponent);

  
  const schema = props.dictionnary[element.tag];

  const component =
    props.resolveComponent?.(element.tag, schema) ?? resolveVueComponent(element.tag);
  assert(typeof component !== "string", `Unknown component <${element.tag}>`);

  // component instances with empty slots must still be editable
  const schemaSlots = schema.slots
    ? Object.fromEntries(Object.keys(schema.slots).map((slotName) => [slotName, []]))
    : {};

  const slots = Object.fromEntries(
    Object.entries({ ...schemaSlots, ...(element.slots ?? {}) }).map(([slotName, children]) => {
      if (props.editing?.id === element.id && props.editing?.slotName === slotName) {
        const container: TransientElement = {
          id: "transient-slot-edition",
          attributes: {},
          isComponent: false,
          tag: "tst-slot-edition",
          slots: { [slotName]: children },
        };

        return [
          slotName,
          nameSlot(slotName, () =>
            h(EditingContainer, {
              container,
              mouse: props.editing!.point,
              ownerId: element.id,
              slotName,
              occurrence: props.editing!.occurrence ?? 0,
              renderComponent,
              render,
              onEdit: (e) => emit("edit", e),
              onExitEditing: () => {
                // the focusout of a root being replaced must not cancel the edition that replaced it
                const isCurrentEditionZone =
                  props.editing?.id === element.id && props.editing?.slotName === slotName;
                if (isCurrentEditionZone) {
                  emit("exitEditing");
                }
              },
              onIslandsMounted: ({ islands }) => {
                islands.forEach((value, key) => {
                  index.value.elements.set(key, value);
                });
              },
            }),
          ),
        ];
      }
      return [slotName, nameSlot(slotName, () => render(children))];
    }),
  );

  const attributes = parseElementAttributes(element);

  const componentVnode = h(component, attributes, slots);
  index.value.elements.set(element.id, componentVnode);
  // freeze
  // componentVnode.shapeFlag = 1 << 3
  return [componentVnode];
}

function renderElement(element: TransientElement) {
  assert(!element.isComponent);

  if (element.tag === "#text") {
    const text = renderText(element);
    return [text];
  }

  if (props.editing?.id === element.id) {
    const editableRootVnode = h(EditingContainer, {
      container: element,
      ownerId: element.id,
      slotName: "default",
      mouse: props.editing.point,
      renderComponent,
      render,
      onEdit: (e) => emit("edit", e),
      onExitEditing: () => emit("exitEditing"),
    });

    index.value.elements.set(element.id, editableRootVnode);
    return [editableRootVnode];
  }
  const attributes = parseElementAttributes(element);

  const children: VNode[] = [];
  //missing slots
  if (element.slots?.default) {
    children.push(...render(element.slots.default));
  }

  const elVnode = h(element.tag, attributes, children);
  index.value.elements.set(element.id, elVnode);
  return [elVnode];
}

function renderText(element: TransientElement) {
  assert(element.tag === "#text");
  const text = String(element.attributes.value?.expression ?? "");
  const textVnode = h(Text, text);
  index.value.elements.set(element.id, textVnode);
  return textVnode;
}
</script>

<template>
  <RenderTemplate />
</template>
