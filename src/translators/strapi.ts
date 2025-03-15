import { join, parse, resolve } from "path";
import { defineTranslator, type TranslatorConfig } from "../translator";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { TransientProp, TransientProps } from "../transient/definition";
import { assert, assertIs, someRecord } from "../helpers/assert";

type StrapiComponent = {
  collectionName: string;
  info: {
    displayName: string;
    icon: string;
  };
  attributes: StrapiAttributes;
};

type StrapiAttributes = { [key: string]: StrapiAttribute };

type StrapiAttribute = {
  type: StrapiAttributeType;
  required: boolean;
  default?: any;
  enum?: string[];
  component?: string;
  repeatable?: boolean;
};

type StrapiAttributeType =
  | "string"
  | "boolean"
  | "enumeration"
  | "integer"
  | "decimal"
  | "component";

type PartialStrapiAttributeType = Partial<StrapiAttribute> & {
  type: StrapiAttribute["type"];
};

type StrapiComponentContext = {
  name: {
    category: string;
    id: string;
    collectionName: string;
  };
};

export function defineStrapiTranslator(
  options: Pick<TranslatorConfig<StrapiComponent>, "dest">
) {
  return defineTranslator<StrapiComponent>({
    ...options,
    translate(components) {
      const strapiComponents: StrapiComponent[] = [];
      for (const [path, component] of Object.entries(components)) {
        const { props } = component;
        const { name: displayName, dir } = parse(path);

        const category = dir || "ui";

        const context: StrapiComponentContext = {
          name: {
            id: displayName.toLowerCase(),
            category: category.toLowerCase(),
            collectionName: `component_${category.toLowerCase()}_${displayName.toLowerCase()}`,
          },
        };

        const collectionName = `component_${context.name.category}_${context.name.id}`;

        const { attributes, options } = toStrapiAttributes(props, context);

        if (options) {
          for (const optionComponent of options) {
            strapiComponents.push(optionComponent);
          }
        }

        strapiComponents.push({
          collectionName,
          info: {
            displayName,
            icon: "",
          },
          attributes,
        });
      }

      return strapiComponents;
    },
    write(results, dest) {
      if (!existsSync(dest)) mkdirSync(dest);

      for (const component of results) {
        const [, category, name] = component.collectionName.split("_");

        assert(
          category && name,
          `Invalid collectionName ${component.collectionName}`
        );

        const destPath = resolve(dest, category);

        if (!existsSync(destPath)) mkdirSync(destPath);

        const componentFilePath = join(destPath, `${name}.json`);

        writeFileSync(componentFilePath, JSON.stringify(component, null, 4));
      }
    },
  });
}

function toStrapiAttributes(
  props: TransientProps,
  context: StrapiComponentContext
): StrapiAttributesConversionResult {
  const attributes: StrapiAttributes = {};
  const options: StrapiComponent[] = [];

  for (const [name, prop] of Object.entries(props)) {
    const { attribute, options: attributeOptions } = toStrapiAttribute(
      prop,
      context
    );

    if (attributeOptions) {
      options.push(...attributeOptions);
    }

    attributes[name] = attribute;
  }

  return { attributes, options };
}

type StrapiAttributesConversionResult = {
  attributes: Record<string, StrapiAttribute>;
  options?: StrapiComponent[];
};

type StrapiAttributeConversionResult = {
  attribute: StrapiAttribute;
  options?: StrapiComponent[];
};

type StrapiAttributeTypeConversionResult = {
  attribute: PartialStrapiAttributeType;
  options?: StrapiComponent[];
};

function toStrapiAttribute(
  prop: TransientProp,
  context: StrapiComponentContext
): StrapiAttributeConversionResult {
  const { attribute, options } = toStrapiAttributeType(prop, context);

  return {
    attribute: {
      required: Boolean(prop.required),
      ...attribute,
      default: prop.default,
    },
    ...(options ? { options } : {}),
  };
}

function toStrapiAttributeType(
  prop: TransientProp,
  context: StrapiComponentContext
): StrapiAttributeTypeConversionResult {
  if (typeof prop.type === "string") {
    switch (prop.type) {
      case "string":
        return { attribute: { type: "string" } };
      case "boolean":
        return { attribute: { type: "boolean" } };
      case "decimal":
        return { attribute: { type: "decimal" } };
      case "integer":
        return { attribute: { type: "integer" } };
      default:
        throw new Error(`unsupported type ${prop.type}`);
    }
  }

  //   "attributes": {
  //   "test": {
  //     "type": "component",
  //     "repeatable": false,
  //     "component": "ui.test"
  //   }
  // }
  switch (prop.type.kind) {
    case "enum":
      return { attribute: fromEnumToStrapiType(prop) };
    case "object": {
      const optionsCollectionName = `component_options_${context.name.id}`;
      const displayName = `options_${context.name.category}_${context.name.id}`;

      const { attributes, options } = toStrapiAttributes(
        prop.type.object,
        context
      );

      return {
        attribute: {
          type: "component",
          component: `options.${context.name.id}`,
        },
        options: [
          {
            collectionName: optionsCollectionName,
            info: {
              displayName,
              icon: "",
            },
            attributes,
          },
          ...(options ? options : []),
        ],
      };
    }
    default:
      throw new Error(`unsupported type ${prop.type.kind}`);
  }
}

function fromEnumToStrapiType(prop: TransientProp): PartialStrapiAttributeType {
  assertIs(someRecord, prop.type);
  assertIs((v) => v === "enum", prop.type.kind);

  const enumeration = prop.type.enum;

  return {
    type: "enumeration",
    enum: enumeration,
  };
}
