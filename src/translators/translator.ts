import { TransientComponentDictionnary } from "../analyzers/analyzer";
import { logger } from "../log/logger";

export type TranslatorConfig<T> = {
  dest?: string;
  write?: (result: T[], dest: string) => void;
  translate(components: TransientComponentDictionnary): T[];
};

export type TranslationConfig = {
  components: TransientComponentDictionnary;
};

export function defineTranslator<T>({
  dest,
  translate,
  write,
}: TranslatorConfig<T>) {
  return ({ components }: TranslationConfig) => {
    logger.announce("component translation");

    const translatedComponents = translate(components);

    logger.result(`${translatedComponents.length} components created`);

    if (dest && write) {
      write(translatedComponents, dest);
      logger.output(`Output : ${dest}`);
    }
    logger.finish("component translation");

    return translatedComponents;
  };
}
