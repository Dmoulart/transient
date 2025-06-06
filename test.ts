import { resolve } from "path";
import { defineVueAnalyzer } from "./packages/transient/src/analyzers/vue/vue";
import { defineStrapiTranslator } from "./packages/transient/src/translators/strapi/strapi";

const LIB_SAMPLES_CONFIG = {
  tsConfigPath: resolve(
    __dirname,
    "../libs-samples/element-plus/tsconfig.base.json"
  ),
  dest: resolve(__dirname, "playground/app-schemas"),
};

const TEST_CONFIG = {
  tsConfigPath: resolve(__dirname, "playground/tsconfig.json"),
  dest: resolve(__dirname, "playground/app-schemas"),
};

const APP_CONFIG = {
  tsConfigPath: resolve(__dirname, "../app/tsconfig.app.json"),
  dest: resolve(__dirname, "playground/app-schemas"),
};

const analyze = defineVueAnalyzer({
  ...TEST_CONFIG,
  // ...LIB_SAMPLES_CONFIG,
  // ...APP_CONFIG,
});

const result = analyze({
  // dir: resolve(__dirname, "../libs-samples/element-plus/packages/components"),
  dir: resolve(__dirname, "playground/components"),
  // dir: resolve(__dirname, "../app/src/components"),
});

// const translate = defineStrapiTranslator({
//   dest: resolve(__dirname, "playground/cms-schemas"),
// });

// const translation = translate({ components: result });
