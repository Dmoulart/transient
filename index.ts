import { resolve } from "path";
import { defineVueAnalyzer } from "./src/analyzers/vue";
import { defineStrapiTranslator } from "./src/translators/strapi";

const LIB_SAMPLES_CONFIG = {
  tsConfigPath: resolve(__dirname, "../libs-samples/tsconfig.json"),
  dest: resolve(__dirname, "playground/app-schemas"),
};

const TEST_CONFIG = {
  tsConfigPath: resolve(__dirname, "playground/tsconfig.json"),
  dest: resolve(__dirname, "playground/app-schemas"),
};

const analyze = defineVueAnalyzer(LIB_SAMPLES_CONFIG);

const result = analyze({
  dir: resolve(__dirname, "../libs-samples/element-plus/packages/components"),
});

const translate = defineStrapiTranslator({
  dest: resolve(__dirname, "playground/cms-schemas"),
});

const translation = translate({ components: result });
