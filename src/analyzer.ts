import { join, parse, resolve } from "path";
import fg from "fast-glob";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { TransientComponent } from "./transient/definition";

export type TransientDictionnary = { [path: string]: TransientComponent };
export type AnalyzeOptions = {
  dir?: string;
};
export type Analyze = (options: AnalyzeOptions) => TransientDictionnary;

export type Analyzer = {
  defaultDir: string;
  tsConfigPath: string;
  dest: string;
  describe(path: string, dir: string): TransientComponent;
  scanDir(dir: string): string[];
  write(result: TransientDictionnary, dest: string): void;
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

export function defineAnalyzer(config: AnalyzerConfig): Analyze {
  const analyzer = {
    ...BASE_ANALYZER,
    ...config,
  } as Analyzer;

  const { defaultDir, describe, tsConfigPath, scanDir, write, dest } = analyzer;

  return ({ dir }) => {
    const componentPaths = scanDir(dir ?? defaultDir);

    const metas: TransientDictionnary = {};

    for (const componentPath of componentPaths) {
      metas[componentPath] = describe(componentPath, dir ?? defaultDir);
    }

    if (dest && write) {
      write(metas, dest);
    }

    return metas;
  };
}
