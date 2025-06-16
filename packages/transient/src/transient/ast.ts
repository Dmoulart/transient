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
  return (element.slots?.default ?? []).some((child) => child.tag === "#text");
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

export function patchElement(
  newElement: TransientElement,
  oldElement: TransientElement
) {
  // const added = addedDiff(newElement, oldElement);
  // const updated = updatedDiff(newElement, oldElement);
  // const deleted = deletedDiff(newElement, oldElement);
  // console.log({ added, updated, deleted });

  // oldElement = {
  //   ...oldElement,
  //   ...added,
  //   ...updated,
  //   ...deleted,
  // };
  console.log({ newElement, oldElement });
  return newElement;
}
/**
 * Perform a deep patch in place from newElement into oldElement.
 * If there are no differences, return undefined.
 * Otherwise, modify in place and return the updated object.
 */
export function patchElement2(
  newElement: TransientElement | any[],
  oldElement: TransientElement | any[]
): TransientElement | undefined {
  let changed = false;

  function deepPatch(src: any, dst: any) {
    if (Array.isArray(src) && Array.isArray(dst)) {
      // Loop through array elements
      for (let i = 0; i < src.length; i++) {
        if (i < dst.length) {
          if (
            src[i] &&
            typeof src[i] === "object" &&
            !Array.isArray(src[i]) &&
            dst[i] &&
            typeof dst[i] === "object" &&
            !Array.isArray(dst[i])
          ) {
            deepPatch(src[i], dst[i]);
          } else if (dst[i] !== src[i]) {
            dst[i] = src[i];
            changed = true;
          }
        } else {
          // new item
          dst.push(src[i]);
          changed = true;
        }
      }
      // Remove excess
      if (dst.length > src.length) {
        dst.splice(src.length);
        changed = true;
      }
    } else if (src && typeof src === "object") {
      for (const key in src) {
        if (src[key] === undefined) continue;

        if (
          src[key] &&
          typeof src[key] === "object" &&
          !Array.isArray(src[key]) &&
          dst[key] &&
          typeof dst[key] === "object" &&
          !Array.isArray(dst[key])
        ) {
          deepPatch(src[key], dst[key]);
        } else if (Array.isArray(src[key]) && Array.isArray(dst[key])) {
          deepPatch(src[key], dst[key]);
        } else if (dst[key] !== src[key]) {
          dst[key] = src[key];
          changed = true;
        }
      }
      // Remove keys not in src
      for (const key in dst) {
        if (src[key] === undefined) {
          delete dst[key];
          changed = true;
        }
      }
    }
  }

  deepPatch(newElement, oldElement);

  return changed ? oldElement : undefined;
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
