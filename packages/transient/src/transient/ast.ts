import { assert, assertIsDefined } from "../core/assert.js";
import {
  type TransientComponentSchema,
  type TransientElement,
  type TransientElementAttributes,
  type TransientProps,
  type TransientType,
  type TransientTypeName,
} from "./definition.js";
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

    if (defaultValue !== undefined) {
      data[prop] = defaultValue;
    }
  }

  return data;
}

export function getElementDefaultPropsValues(
  props: TransientProps,
): TransientElementAttributes {
  const data: Record<string, any> = {};

  for (const prop in props) {
    const defaultValue = props[prop]?.default;

    data[prop] = { expression: defaultValue, type: "literal" };
  }

  return data;
}

export function hasTextChildren(
  element: TransientElement,
  slotName = "default",
): boolean {
  return slotContainsSome(element, (child) => child.tag === "#text", slotName);
}

export function slotContainsSome(
  element: TransientElement,
  cb: (
    value: TransientElement,
    index: number,
    array: TransientElement[],
  ) => boolean,
  slotName = "default",
): boolean {
  if (!element.slots?.[slotName]) {
    return false;
  }

  return element.slots[slotName].some(cb);
}

export function isTextZone(
  element: TransientElement,
  slotName = "default",
): boolean {
  return (
    !element.slots?.[slotName] ||
    hasTextChildren(element, slotName) ||
    (slotContainsSome(element, (child) => child.tag === "br", slotName) &&
      element.slots?.[slotName]?.length === 1) ||
    element.slots?.[slotName]?.length === 0
  );
}

export function hasSlots(element: TransientElement): boolean {
  return element.slots !== undefined;
}

export function findElementById(
  elements: TransientElement[],
  id: string,
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

export function getPathOfElementById(
  elements: TransientElement[],
  id: string,
  depth = 0,
  path: Array<string | number> = [],
): Array<string | number> | undefined {
  for (let i = 0; i < elements.length; i++) {
    path[depth] = i;

    const element = elements[i]!;

    if (element.id === id) {
      return path;
    }

    const slotsChildren =
      element.slots && Object.keys(element.slots)?.length > 0
        ? Object.entries(element.slots)
        : null;

    if (slotsChildren) {
      for (const [slotName, slotElements] of slotsChildren) {
        const newPath = [...path, "slots", slotName];

        const found = getPathOfElementById(
          slotElements,
          id,
          newPath.length,
          newPath,
        );

        if (found) {
          return found;
        }
      }
    }
  }

  return undefined;
}

export function findNearestAncestor(
  elements: TransientElement[],
  id: string,
  cb: (element: TransientElement) => boolean,
): TransientElement | undefined {
  let path = getPathOfElementById(elements, id);
  if (!path) {
    return undefined;
  }
  let len = path.length;
  // pop current array, slotName, slots key every step to avoid matching a brother or an uncle..
  const up = () => {
    // wasteful, path should maybe not be a literal object path
    len -= 3;
    if (len <= 0) return undefined;
    return path!.slice(0, len);
  };
  while ((path = up()) !== undefined) {
    //@ts-expect-error
    const candidate: TransientElement = path.reduce(
      //@ts-expect-error
      (newPath, key) => newPath[key],
      elements,
    );

    if (cb(candidate as TransientElement)) {
      return candidate as TransientElement;
    }
  }

  return undefined;
}

export function replaceElement(
  newElement: TransientElement,
  elements: TransientElement[],
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
  elements: TransientElement[], // assumed root or current branch
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
  elements: TransientElement[],
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
  elements: TransientElement[],
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
  elements: TransientElement[],
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
  elements: TransientElement[],
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

export function updateElementProp(
  propName: string,
  value: any,
  id: string,
  elements: TransientElement[],
): void {
  const element = findElementById(elements, id);

  assertIsDefined(element, `Element with id ${id} not found`);
  // only literals are supported for now
  element.attributes[propName] ??= { type: "literal", expression: "" };
  element.attributes[propName].expression = value;
}

export function getElementProps(
  schema: TransientComponentSchema,
  element: TransientElement,
): TransientElementAttributes {
  return {
    ...getElementDefaultPropsValues(schema.props),
    ...element.attributes,
  };
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
