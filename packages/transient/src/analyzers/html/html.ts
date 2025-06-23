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

  const element = node as Element;

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

  const children: TransientElement[] = [];
  const childNodes = Array.from(element.childNodes);

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]!;

    if (
      child.nodeType === Node.TEXT_NODE &&
      child.textContent !== null &&
      child.textContent.length > 0
    ) {
      let textContent = child.textContent ?? "";
      let textId = getTransientID(child) ?? id;

      // Merge consecutive text nodes
      while (
        i + 1 < childNodes.length &&
        childNodes[i + 1]!.nodeType === Node.TEXT_NODE &&
        childNodes[i + 1]!.textContent !== null &&
        childNodes[i + 1]!.textContent!.length > 0
      ) {
        i++;
        textContent += childNodes[i]!.textContent ?? "";
      }

      children.push({
        id: textId,
        tag: "#text",
        isComponent: false,
        attributes: {
          value: {
            type: "literal",
            expression: textContent,
          },
        },
      });

      continue;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(htmlNodeToTransientElement(child as Element, id));
    }
  }

  const slots: Record<string, TransientElement[]> = {
    default: children,
  };
  console.log({
    id,
    tag: element.tagName,
    isComponent: false,
    attributes,
    slots,
  });
  return {
    id,
    tag: element.tagName,
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
