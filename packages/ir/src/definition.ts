export type TransientComponentDictionnary = {
  [tag: string]: TransientComponentSchema
}

export type TransientElementAttributes = Record<string, TransientAttribute>
export type TransientAttribute = BindingInfo
export type TransientElement = {
  id: string
  tag: string
  isComponent: boolean
  attributes: TransientElementAttributes
  slots?: Record<string, TransientElement[]>
}

export type TransientTemplate = {
  elements: TransientElement[]
}

export type TransientComponentSchema = {
  tag: string
  path: string
  props: TransientProps
  slots?: TransientSlots
  template: TransientTemplate
}

export type TransientSlots = Record<string, TransientSlot>

export type TransientProps = Record<string, TransientProp>

export type TransientProp = {
  type: TransientType
  description?: string
  required?: boolean
  default?: string | number | boolean | undefined
}

// unused for now
export type TransientSlot = Record<string, never>

export type TransientType<T extends TransientTypeName = TransientTypeName> =
  T extends TransientPrimitiveTypeName
    ? T | { kind: T }
    : T extends 'enum'
      ? { kind: 'enum'; enum: (string | number)[] }
      : T extends 'object'
        ? { kind: 'object'; object: Record<string, TransientProp> }
        : T extends 'list'
          ? { kind: 'list'; list: TransientProp }
          : T extends 'record'
            ? { kind: 'record' }
            : T extends 'union'
              ? { kind: 'union'; union: TransientType[] }
              : { kind: T }

export type TransientTypeName = TransientPrimitiveTypeName | TransientComplexTypeName

export type TransientComplexTypeName = 'list' | 'object' | 'union' | 'enum' | 'record'

export type TransientPrimitiveTypeName = 'boolean' | 'integer' | 'decimal' | 'unknown' | 'string'

export type BindingInfo = {
  type: 'prop' | 'literal'
  expression: BindingValue
}

export type BindingValue = string | number | boolean | undefined | Record<string, unknown>
