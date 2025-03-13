import { join, parse, resolve } from "path";
import { ComponentApi } from "./meta/component-api";
import fg from "fast-glob";
import { existsSync, mkdirSync, writeFileSync } from "fs";

export type AnalyzeResult = { [path: string]: ComponentApi };
export type AnalyzeOptions = {
  dir?: string;
};
export type Analyze = (options: AnalyzeOptions) => AnalyzeResult;

export type Analyzer = {
  defaultDir: string;
  tsConfigPath: string;
  describe: (path: string, dir: string) => ComponentApi;
  scanDir: (dir: string) => string[];
  dest: string;
  write(result: AnalyzeResult, dest: string);
};

export type AnalyzerConfig = Partial<Analyzer> & {
  tsConfigPath: string;
  describe: Analyzer["describe"];
};

const BASE_ANALYZER: Partial<Analyzer> = {
  defaultDir: ".",
  tsConfigPath: "./tsconfig.json",
  scanDir(dir: string) {
    return fg.sync([`./**/*`], {
      cwd: resolve(__dirname, dir),
      absolute: false,
    });
  },
  write(results, dest) {
    for (const [path, api] of Object.entries(results)) {
      const { name: componentName, dir: componentDir } = parse(path);
      const metaComponentDirPath = resolve(dest, componentDir);

      // if meta dir doesn't exist create
      if (!existsSync(metaComponentDirPath)) mkdirSync(metaComponentDirPath);

      const metaJsonFilePath = join(
        metaComponentDirPath,
        `${componentName}.json`
      );

      writeFileSync(metaJsonFilePath, JSON.stringify(api, null, 4));
    }
  },
};

export function createAnalyzer(config: AnalyzerConfig): Analyze {
  const analyzer = {
    ...BASE_ANALYZER,
    ...config,
  } as Analyzer;

  const { defaultDir, describe, tsConfigPath, scanDir, write, dest } = analyzer;

  return ({ dir }) => {
    const componentPaths = scanDir(dir ?? defaultDir);

    const metas: AnalyzeResult = {};

    for (const componentPath of componentPaths) {
      metas[componentPath] = describe(componentPath, dir ?? defaultDir);
    }

    if (dest && write) {
      write(metas, dest);
    }

    return metas;
  };
}
