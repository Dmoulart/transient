import { assert } from "../core/assert";
import {
  type TransientComponentSchema,
  type TransientElement,
  type TransientProps,
  type TransientType,
  type TransientTypeName,
} from "./definition";
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
  if (!element.slots?.default) {
    return false;
  }

  return element.slots.default.some((child) => child.tag === "#text");
}

export function hasSlots(element: TransientElement): boolean {
  return element.slots !== undefined;
}

export function findElementById(
  elements: TransientElement[],
  id: string
): TransientElement | undefined {
  for (const element of elements) {
    if (element.id === id) return element;

    if (element.slots) {
      for (const slotElements of Object.values(element.slots)) {
        const found = findElementById(slotElements, id);
        if (found) return found;
      }
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

    if (elements[i]!.slots) {
      for (const slotName in elements[i]!.slots) {
        const slotElements = elements[i]!.slots![slotName];

        if (slotElements) {
          const updated = replaceElement(newElement, slotElements);

          if (updated) {
            return updated;
          }
        }
      }
    }
  }

  return undefined;
}
export function replaceElementSlot(
  newSlotContent: TransientElement[],
  slot: string,
  ownerId: string,
  elements: TransientElement[] // assumed root or current branch
) {
  const owner = findElementById(elements, ownerId);
  if (!owner) {
    throw new Error("Unknown slot parent");
  }
  owner.slots ??= {};
  owner.slots[slot] = newSlotContent;
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

  parent.slots = parent.slots ?? {};
  parent.slots.default = parent.slots.default ?? [];

  parent.slots.default.push(element);
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

    if (elements[i]!.slots) {
      for (const slotName in elements[i]!.slots) {
        if (removeElement(idToRemove, elements[i]!.slots![slotName]!)) {
          return true;
        }
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

    if (elements[i]!.slots) {
      for (const slotName in elements[i]!.slots) {
        if (
          insertAfterElement(newElement, id, elements[i]!.slots![slotName]!)
        ) {
          return true;
        }
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

    if (elements[i]!.slots) {
      for (const slotName in elements[i]!.slots) {
        if (
          insertBeforeElement(newElement, id, elements[i]!.slots![slotName]!)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function createTextElement(text: string): TransientElement {
  return {
    id: crypto.randomUUID(),
    tag: "#text",
    isComponent: false,
    attributes: {
      value: {
        type: "literal",
        expression: text,
      },
    },
  };
}
