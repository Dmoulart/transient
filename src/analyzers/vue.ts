import { ComponentMeta, createChecker } from "vue-component-meta";
import { Analyzer, AnalyzerConfig, defineAnalyzer } from "../analyzer";
import { resolve } from "path";
import { ComponentApi, ComponentProp } from "../meta/component-api";

export function defineVueAnalyzer(
  options: Pick<AnalyzerConfig, "tsConfigPath" | "dest">
) {
  const checker = createChecker(options.tsConfigPath, {
    forceUseTs: true,
    printer: { newLine: 1 },
  });

  return defineAnalyzer({
    dest: options.dest,
    tsConfigPath: options.tsConfigPath,
    describe(path, dir) {
      const meta = checker.getComponentMeta(resolve(__dirname, dir, path));
      return describeComponent(meta);
    },
  });
}

function describeComponent(meta: ComponentMeta): ComponentApi {
  const props: ComponentProp[] = [];

  meta.props.forEach((prop) => {
    if (prop.global) return;

    const { name, description, required, default: defaultValue, schema } = prop;

    props.push({
      name,
      description,
      required,
      default: defaultValue,
      schema,
    });
  });

  return {
    props,
  };
}
