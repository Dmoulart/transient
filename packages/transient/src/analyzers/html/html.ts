import type { TransientElement, BindingInfo } from "../../transient/definition";

export function htmlNodeToTransientElement(
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
    )
      continue;

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

export function getTransientID(node: Node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return getTextNodeTransientId(node);
    case Node.COMMENT_NODE:
      return getTransientIdFromComment(node);
    case Node.ELEMENT_NODE:
      return getElementTransientId(node as Element);
    default: {
      console.error("not implemented transient id on node", node);
      return undefined;
    }
  }
}

export function getElementTransientId(elementNode: Element) {
  if (elementNode instanceof HTMLElement) {
    return elementNode.dataset.transientId;
  }
}

export function getTextNodeTransientId(textNode: Node) {
  // le précédent est le commentaire
  const prev = textNode.previousSibling;

  if (prev && prev.nodeType === Node.COMMENT_NODE) {
    return getTransientIdFromComment(prev);
  }
}

export function getTransientIdFromComment(commentNode: Node) {
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
