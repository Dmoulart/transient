import {
  type TransientComponentSchema,
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
