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
  id: number
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
  elements: TransientElement[],
  newElement: TransientElement
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
          const updated = replaceElement(slotElements, newElement);

          if (updated) {
            return updated;
          }
        }
      }
    }
  }

  return undefined;
}
