import { join, parse, resolve } from "path";
import fg from "fast-glob";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { TransientComponent } from "./transient/definition";
import { logger } from "./log/logger";
export type TransientDictionnary = { [path: string]: TransientComponent };
export type AnalyzeOptions = {
  dir?: string;
};
export type Analyze = (options: AnalyzeOptions) => TransientDictionnary;

export type Analyzer = {
  defaultDir: string;
  tsConfigPath: string;
  dest: string;
  log: boolean;
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
  log: true,
  scanDir(dir: string) {
    const files = fg.sync([`./**/*`], {
      cwd: resolve(__dirname, dir),
      absolute: false,
    });

    logger.info(`Found ${files.length} files`);

    return files;
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

      writeFileSync(metaJsonFilePath, JSON.stringify(api, null, 2));
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
    logger.announce("components analysis");

    const componentPaths = scanDir(dir ?? defaultDir);

    const metas: TransientDictionnary = {};

    for (const componentPath of componentPaths) {
      logger.processing(componentPath);
      metas[componentPath] = describe(componentPath, dir ?? defaultDir);
      logger.result("OK");
    }

    if (dest && write) {
      write(metas, dest);
      logger.output(`Output : ${dest}`);
    }
    logger.finish("components analysis");

    return metas;
  };
}
