import type { PropertyMetaSchema } from "vue-component-meta";

export type ComponentProp = {
  name: string;
  description: string;
  required: boolean;
  default: string | undefined;
  schema: PropertyMetaSchema;
};

export type ComponentApi = {
  props: ComponentProp[];
};
