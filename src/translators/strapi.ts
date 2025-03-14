import { join, parse, resolve } from "path";
import { defineTranslator, type TranslatorConfig } from "../translator";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { TransientProp } from "../transient/definition";
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
};

type StrapiAttributeType =
  | "string"
  | "boolean"
  | "enumeration"
  | "integer"
  | "decimal";

type PartialStrapiAttributeType = Partial<StrapiAttribute> & {
  type: StrapiAttribute["type"];
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

        const collectionName = `component_${category.toLowerCase()}_${displayName.toLowerCase()}`;

        strapiComponents.push({
          collectionName,
          info: {
            displayName,
            icon: "",
          },
          attributes: toStrapiAttributes(props),
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

function toStrapiAttributes(props: TransientProp[]): StrapiAttributes {
  const attributes: StrapiAttributes = {};

  for (const prop of props) {
    attributes[prop.name] = toStrapiAttribute(prop);
  }

  return attributes;
}

function toStrapiAttribute(prop: TransientProp): StrapiAttribute {
  return {
    required: Boolean(prop.required),
    ...toStrapiAttributeType(prop),
    default: prop.default,
  };
}

function toStrapiAttributeType(
  prop: TransientProp
): PartialStrapiAttributeType {
  if (typeof prop.type === "string") {
    switch (prop.type) {
      case "string":
        return { type: "string" };
      case "boolean":
        return { type: "boolean" };
      case "decimal":
        return { type: "decimal" };
      case "integer":
        return { type: "integer" };
      default:
        throw new Error(`unsupported type ${prop.type}`);
    }
  }
  switch (prop.type.kind) {
    case "enum":
      return fromEnumToStrapiType(prop);
    case "object":
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
