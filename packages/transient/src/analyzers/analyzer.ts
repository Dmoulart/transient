import { dirname, resolve } from "path";
import fastGlob from "fast-glob";
import type { Pattern } from "fast-glob";
import { writeFileSync } from "fs";
import type {
  TransientComponentDictionnary,
  TransientComponentSchema,
} from "../transient/definition";
import { logger } from "../log/logger.js";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { sync } = fastGlob;

export type AnalyzeOptions = {
  dir?: string;
};
export type Analyze = (
  options: AnalyzeOptions,
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
    logger.info(`Scanning directories : ${resolve(__dirname, dir)} ${glob}`);
    const files = sync(glob, {
      cwd: resolve(__dirname, dir),
      absolute: false,
    });

    return files;
  },
  write(results, dest) {
    writeFileSync(
      resolve(dest, "__schemas__.json"),
      JSON.stringify(results, null, 2),
    );
  },
};

export function defineAnalyzer(config: AnalyzerConfig): Analyze {
  const analyzer = {
    ...BASE_ANALYZER,
    ...config,
  } as Analyzer;

  const { defaultDir, describe, scanDir, write, dest, glob } = analyzer;

  return ({ dir }) => {
    logger.announce("components analysis");

    const componentPaths = scanDir(dir ?? defaultDir, glob);
    logger.info(`Found ${componentPaths.length} files`);

    const metas: TransientComponentDictionnary = {};

    for (const componentPath of componentPaths) {
      logger.processing(componentPath);
      const component = describe(componentPath, dir ?? defaultDir);
      metas[component.tag] = component;
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
