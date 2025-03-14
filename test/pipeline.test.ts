import { resolve } from "path";
import { defineVueAnalyzer } from "../src/analyzers/vue";
import { defineStrapiTranslator } from "../src/translators/strapi";
import { expect, test } from "bun:test";

test("vue-to-transient-to-strapi", () => {
  const analyze = defineVueAnalyzer({
    tsConfigPath: resolve(__dirname, "./tsconfig.json"),
  });

  const result = analyze({
    dir: resolve(__dirname, "./components"),
  });

  expect(result["Test.vue"]).toEqual({
    props: [
      {
        name: "text",
        default: "ok",
        required: false,
        type: "string",
      },
      {
        name: "display",
        required: true,
        type: "boolean",
      },
      {
        name: "maybeDisplay",
        required: false,
        type: "boolean",
      },
      {
        name: "env",
        required: true,
        type: {
          kind: "enum",
          enum: ["prod", "dev"],
        },
      },
      {
        name: "version",
        default: "0",
        required: false,
        type: {
          kind: "enum",
          enum: ["0", "1", "2"],
        },
      },
      {
        name: "level",
        required: true,
        type: "decimal",
      },
    ],
  });

  const translate = defineStrapiTranslator({});

  const [Test] = translate({ components: result });

  expect(Test).toEqual({
    collectionName: "component_ui_test",
    info: {
      displayName: "Test",
      icon: "",
    },
    attributes: {
      text: {
        required: false,
        type: "string",
        default: "ok",
      },
      display: {
        required: true,
        type: "boolean",
      },
      maybeDisplay: {
        required: false,
        type: "boolean",
      },
      env: {
        required: true,
        type: "enumeration",
        enum: ["prod", "dev"],
      },
      version: {
        required: false,
        type: "enumeration",
        enum: ["0", "1", "2"],
        default: "0",
      },
      level: {
        required: true,
        type: "decimal",
      },
    },
  });
});
