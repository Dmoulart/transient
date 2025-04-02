import { defineVueAnalyzer, type VueAnalyzerOptions } from "./vue";
export function transient(options: VueAnalyzerOptions) {
  const analyze = defineVueAnalyzer(options);
  return {
    name: "vite-plugin-vue-transient",
    handleHotUpdate() {
      console.log(`Hello! HMR updated: `);
    },
  };
}
