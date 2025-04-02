import { resolve } from "path";
import { defineStrapiTranslator, defineVueAnalyzer } from "transient";

const TEST_CONFIG = {
  tsConfigPath: resolve(__dirname, "./tsconfig.json"),
  dest: resolve(__dirname, "./app-schemas"),
};

const analyze = defineVueAnalyzer({
  ...TEST_CONFIG,
});

const translate = defineStrapiTranslator({
  dest: resolve(__dirname, "./cms-schemas"),
});

const components = analyze({
  dir: resolve(__dirname, "./components"),
});

const translation = translate({ components });
