import { resolve } from "path";
import { defineVueAnalyzer } from "./src/analyzers/vue";
import { defineStrapiTranslator } from "./src/translators/strapi";

const analyze = defineVueAnalyzer({
  tsConfigPath: resolve(__dirname, "playground/tsconfig.json"),
  dest: resolve(__dirname, "playground/app-schemas"),
});

const result = analyze({
  dir: resolve(__dirname, "playground/components"),
});

const translate = defineStrapiTranslator({
  dest: resolve(__dirname, "playground/cms-schemas"),
});

const translation = translate({ components: result });
