import { join, parse, resolve } from "path";
import fg, { type Pattern } from "fast-glob";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import type { TransientComponentSchema } from "../transient/definition";
import { logger } from "../log/logger";

export type TransientComponentDictionnary = {
  [path: string]: TransientComponentSchema;
};
export type AnalyzeOptions = {
  dir?: string;
};
export type Analyze = (
  options: AnalyzeOptions
) => TransientComponentDictionnary;

export type Analyzer = {
  defaultDir: string;
  tsConfigPath: string;
  dest: string;
  log: boolean;
  glob: Pattern;
  describe(path: string, dir: string): TransientComponentSchema;
  scanDir(dir: string, glob: Pattern): string[];
  write(result: TransientComponentDictionnary, dest: string): void;
};

export type AnalyzerConfig = Partial<Analyzer> & {
  tsConfigPath: string;
  describe: Analyzer["describe"];
};

const BASE_ANALYZER: Partial<Analyzer> = {
  defaultDir: ".",
  tsConfigPath: "./tsconfig.json",
  log: true,
  scanDir(dir: string, glob: Pattern) {
    const files = fg.sync(glob, {
      cwd: resolve(__dirname, dir),
      absolute: false,
    });

    return files;
  },
  write(results, dest) {
    for (const [path, api] of Object.entries(results)) {
      const { name: componentName, dir: componentDir } = parse(path);
      const metaComponentDirPath = resolve(dest, componentDir);

      // if meta dir doesn't exist create
      if (!existsSync(metaComponentDirPath)) {
        mkdirSync(metaComponentDirPath, {
          recursive: true,
        });
      }

      const metaJsonFilePath = join(
        metaComponentDirPath,
        `${componentName}.json`
      );

      writeFileSync(metaJsonFilePath, JSON.stringify(api, null, 2));
    }

    // write all
    writeFileSync(
      resolve(dest, "__schemas__.json"),
      JSON.stringify(results, null, 2)
    );
  },
};

export function defineAnalyzer(config: AnalyzerConfig): Analyze {
  const analyzer = {
    ...BASE_ANALYZER,
    ...config,
  } as Analyzer;

  const { defaultDir, describe, tsConfigPath, scanDir, write, dest, glob } =
    analyzer;

  return ({ dir }) => {
    logger.announce("components analysis");

    const componentPaths = scanDir(dir ?? defaultDir, glob);
    logger.info(`Found ${componentPaths.length} files`);

    const metas: TransientComponentDictionnary = {};

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
