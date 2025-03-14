import { join, parse, resolve } from "path";
import { ComponentProp } from "../meta/component-api";
import { defineTranslator, TranslatorConfig } from "../translator";
import assert from "assert";
import { existsSync, mkdirSync, writeFileSync } from "fs";

type StrapiAttribute = {
  type: "string" | "boolean";
};
type StrapiAttributes = { [key: string]: StrapiAttribute };
type StrapiComponent = {
  collectionName: string;
  info: {
    displayName: string;
    icon: string;
  };
  attributes: StrapiAttributes;
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

        const collectionName = `component_${
          dir || "ui"
        }_${displayName.toLowerCase()}`;

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

        assert(category && name, "Invalid component name");

        const destPath = resolve(dest, category);

        if (!existsSync(destPath)) mkdirSync(destPath);

        const componentFilePath = join(destPath, `${name}.json`);

        writeFileSync(componentFilePath, JSON.stringify(component, null, 4));
      }
    },
  });
}

function toStrapiAttributes(props: ComponentProp[]): StrapiAttributes {
  const attributes: StrapiAttributes = {};
  for (const prop of props) {
    attributes[prop.name] = toStrapiAttribute(prop);
  }
  return attributes;
}

function toStrapiAttribute(prop: ComponentProp): StrapiAttribute {
  if (typeof prop.schema === "string") {
    switch (prop.schema) {
      case "string":
        return {
          type: "string",
        };
      case "boolean":
        return {
          type: "boolean",
        };

      default:
        throw new Error(`${prop.name} : unsupported type ${prop.schema}`);
    }
  }
  switch (prop.schema.kind) {
    case "array":
    case "enum":
    case "event":
    case "object":
      throw new Error(`${prop.name} : unsupported type ${prop.schema.kind}`);
  }
}
