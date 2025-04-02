import { type TransientType, type TransientTypeName } from "./definition";

export function getTypeKind(type: TransientType): TransientTypeName {
  return typeof type === "string" ? type : type.kind;
}
