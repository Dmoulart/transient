import { resolve } from "path";
import { createVueAnalyzer } from "./src/analyzers/vue";

const analyze = createVueAnalyzer({
  tsConfigPath: resolve(__dirname, "playground/tsconfig.json"),
  dest: resolve(__dirname, "playground/meta"),
});

analyze({
  dir: resolve(__dirname, "playground/components"),
});
