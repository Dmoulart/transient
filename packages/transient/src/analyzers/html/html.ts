import type { TransientElement, BindingInfo } from "../../transient/definition";

export function htmlNodeToTransientElement(
  node: Element | Text,
  id: number
): TransientElement {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      id,
      tag: "#text",
      isComponent: false,
      attributes: {
        value: {
          type: "literal",
          expression: node.textContent?.trim() ?? "",
        },
      },
    };
  }

  const element = node as HTMLElement;

  const attributes: Record<string, BindingInfo> = {};

  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith("data-transient")) continue;

    attributes[attr.name] = {
      type: "literal",
      expression: attr.value,
    };
  }

  const children = Array.from(element.childNodes)
    .filter((child) => {
      return (
        child.nodeType === Node.ELEMENT_NODE ||
        (child.nodeType === Node.TEXT_NODE &&
          child.textContent &&
          child.textContent.trim().length > 0)
      );
    })
    .map((child) =>
      htmlNodeToTransientElement(child as HTMLElement | Text, id)
    );

  const slots: Record<string, TransientElement[]> = {
    default: children,
  };

  return {
    id,
    tag: element.tagName.toLowerCase(),
    isComponent: false,
    attributes,
    slots,
  };
}
