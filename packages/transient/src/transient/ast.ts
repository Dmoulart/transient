import { assert } from "../core/assert";
import {
  type TransientComponentSchema,
  type TransientElement,
  type TransientProps,
  type TransientType,
  type TransientTypeName,
} from "./definition";
import { addedDiff, deletedDiff, updatedDiff } from "deep-object-diff";
export function getTypeKind(type: TransientType): TransientTypeName {
  return typeof type === "string" ? type : type.kind;
}

export function getTextValue(element: TransientElement) {
  assert(element.tag === "#text");
  return element.attributes?.value?.expression;
}
export function getComponentDefaultPropsValues(props: TransientProps) {
  const data: Record<string, any> = {};

  for (const prop in props) {
    const defaultValue = props[prop]?.default;

    if (defaultValue) {
      data[prop] = defaultValue;
    }
  }

  return data;
}

export function hasTextChildren(element: TransientElement): boolean {
  return (element.children ?? []).some((child) => child.tag === "#text");
}

export function hasChildren(element: TransientElement): boolean {
  return element.children !== undefined;
}

export function findElementById(
  elements: TransientElement[],
  id: string
): TransientElement | undefined {
  for (const element of elements) {
    if (element.id === id) return element;

    if (element.children) {
      const found = findElementById(element.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function replaceElement(
  newElement: TransientElement,
  elements: TransientElement[]
): TransientElement | undefined {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i]!.id === newElement.id) {
      elements[i] = newElement;
      return newElement;
    }

    if (elements[i]!.children) {
      const slotElements = elements[i]!.children;

      if (slotElements) {
        const updated = replaceElement(newElement, slotElements);

        if (updated) {
          return updated;
        }
      }
    }
  }

  return undefined;
}

export function appendElement(
  element: TransientElement,
  parentId: string,
  elements: TransientElement[]
) {
  const parent = findElementById(elements, parentId);
  if (!parent) {
    console.warn(`appendElement: parent ${parentId} non trouvé.`);
    return false;
  }

  parent.children ??= [];

  parent.children.push(element);
  return true;
}

export function removeElement(
  idToRemove: string,
  elements: TransientElement[]
): boolean {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i]!.id === idToRemove) {
      elements.splice(i, 1);
      return true;
    }

    if (elements[i]!.children) {
      if (removeElement(idToRemove, elements[i]!.children!)) {
        return true;
      }
    }
  }
  return false;
}

export function insertAfterElement(
  newElement: TransientElement,
  id: string,
  elements: TransientElement[]
): boolean {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i]!.id === id) {
      elements.splice(i + 1, 0, newElement);
      return true;
    }

    if (elements[i]!.children) {
      if (insertAfterElement(newElement, id, elements[i]!.children!)) {
        return true;
      }
    }
  }
  return false;
}

export function insertBeforeElement(
  newElement: TransientElement,
  id: string,
  elements: TransientElement[]
): boolean {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i]!.id === id) {
      elements.splice(i, 0, newElement);
      return true;
    }

    if (elements[i]!.children) {
      if (insertBeforeElement(newElement, id, elements[i]!.children!)) {
        return true;
      }
    }
  }
  return false;
}
