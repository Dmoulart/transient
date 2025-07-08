import { assertIsDefined } from "../../core/assert";
import type { TransientElement, BindingInfo } from "../../transient/definition";

export function htmlChildrenToTransientElements(node: Element) {
  const elements: TransientElement[] = [];
  for (const child of Array.from(node.childNodes)) {
    if (
      child.nodeType === Node.COMMENT_NODE ||
      (child.nodeType === Node.TEXT_NODE && child.textContent === "")
    ) {
      continue;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      if (child instanceof HTMLElement) {
        if ("transientPlaceholder" in child.dataset) {
          elements.push(...htmlChildrenToTransientElements(child));
          continue;
        }
      }
    }

    elements.push(
      htmlElementToTransientElement(
        child,
        getTransientID(child) ?? crypto.randomUUID()
      )
    );
  }

  return elements;
}

export function htmlElementToTransientElement(
  node: Element | Text | Node,
  id: string
): TransientElement {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      id,
      tag: "#text",
      isComponent: false,
      attributes: {
        value: {
          type: "literal",
          expression: node.textContent ?? "",
        },
      },
    };
  }

  const element = node as HTMLElement;

  const attributes: Record<string, BindingInfo> = {};

  for (const attr of Array.from(element.attributes)) {
    if (
      attr.name === "contenteditable" ||
      attr.name.startsWith("data-transient")
    ) {
      continue;
    }

    attributes[attr.name] = {
      type: "literal",
      expression: attr.value,
    };
  }

  if (element.dataset.transientComponent) {
    const slots: Record<string, TransientElement[]> = {};

    const children = element.querySelectorAll<HTMLElement>(
      "[data-transient-slot]"
    );

    for (const child of Array.from(children)) {
      const slot = child.dataset.transientSlot;

      if (!slot) continue;

      const [slotName, ownerID] = slot.split(":");

      assertIsDefined(slotName);
      assertIsDefined(ownerID);

      if (ownerID !== getTransientID(element)) continue;

      slots[slotName] ??= [];

      slots[slotName]!.push(...htmlChildrenToTransientElements(child));
    }

    return {
      id,
      tag: element.dataset.transientComponent,
      isComponent: true,
      attributes,
      slots: Object.keys(slots).length ? slots : undefined,
    };
  }

  const slots: Record<string, TransientElement[]> = {
    default: htmlChildrenToTransientElements(element),
  };

  return {
    id,
    tag: element.tagName.toLowerCase(),
    isComponent: false,
    attributes,
    slots,
  };
}

export function getTransientID(node: Node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return getTextNodeTransientID(node);
    case Node.COMMENT_NODE:
      return getCommentNodeTransientID(node);
    case Node.ELEMENT_NODE:
      return getElementNodeTransientID(node as Element);
    default: {
      console.error("not implemented transient id on node", node);
      return undefined;
    }
  }
}

export function getElementNodeTransientID(elementNode: Element) {
  if (elementNode instanceof HTMLElement) {
    return elementNode.dataset.transientId;
  }
}

export function getTextNodeTransientID(textNode: Node) {
  const prev = textNode.previousSibling;

  if (prev && prev.nodeType === Node.COMMENT_NODE) {
    console.log("text node", getCommentNodeTransientID(prev));
    return getCommentNodeTransientID(prev);
  }
}

export function getCommentNodeTransientID(commentNode: Node) {
  if (commentNode.nodeValue) {
    // extraire l'ID depuis le commentaire
    const match = commentNode.nodeValue.match(
      /#text data-transient-id=([0-9a-fA-F-]+)/
    );

    if (match) {
      const id = match[1];
      return id;
    }
  }
}
