import fs, { existsSync, mkdirSync } from "fs";
import { join, parse, resolve } from "path";
import fg from "fast-glob";
import type { ComponentMeta } from "vue-component-meta";
import { createChecker } from "vue-component-meta";

export interface ComponentApiProps {
  name: ComponentMeta["props"][number]["name"];
  description: ComponentMeta["props"][number]["description"];
  required: ComponentMeta["props"][number]["required"];
  type: ComponentMeta["props"][number]["type"];
  default: ComponentMeta["props"][number]["default"];
  schema: ComponentMeta["props"][number]["schema"];
}

export interface ComponentApi {
  props: ComponentApiProps[];
  events: ComponentMeta["events"];
  slots: ComponentMeta["slots"];
}

const tsconfigChecker = createChecker(
  resolve(__dirname, "playground/tsconfig.json"),
  {
    forceUseTs: true,
    printer: { newLine: 1 },
  }
);
const filterMeta = (meta: ComponentMeta): ComponentApi => {
  const props: ComponentApiProps[] = [];

  meta.props.forEach((prop) => {
    if (prop.global) return;

    const {
      name,
      description,
      required,
      type,
      default: defaultValue,
      schema,
    } = prop;
    props.push({
      name,
      description,
      required,
      type,
      default: defaultValue || "unknown",
      schema,
    });
  });

  return {
    props,
    events: meta.events,
    slots: meta.slots,
  };
};

const COMPONENTS_DIR = "playground/components";
debugger;

// Collect components
const components = fg.sync([`./**/*.vue`], {
  cwd: resolve(__dirname, COMPONENTS_DIR),
  absolute: false,
});

// Generate component meta
components.forEach((componentPath) => {
  const { name: componentName, dir: componentDir } = parse(componentPath);
  const meta = filterMeta(
    tsconfigChecker.getComponentMeta(
      resolve(__dirname, COMPONENTS_DIR, componentPath)
    )
  );

  const metaComponentDirPath = resolve(
    __dirname,
    "./playground/meta",
    componentDir
  );

  // if meta dir doesn't exist create
  if (!existsSync(metaComponentDirPath)) mkdirSync(metaComponentDirPath);

  const metaJsonFilePath = join(metaComponentDirPath, `${componentName}.json`);
  fs.writeFileSync(metaJsonFilePath, JSON.stringify(meta, null, 4));
});
