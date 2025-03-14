import type { TransientDictionnary } from "./analyzer";

export type TranslatorConfig<T> = {
  dest?: string;
  write?: (result: T[], dest: string) => void;
  translate(components: TransientDictionnary): T[];
};

export type TranslationConfig = {
  components: TransientDictionnary;
};

export function defineTranslator<T>({
  dest,
  translate,
  write,
}: TranslatorConfig<T>) {
  return ({ components }: TranslationConfig) => {
    const translatedComponents = translate(components);

    if (dest && write) {
      write(translatedComponents, dest);
    }

    return translatedComponents;
  };
}
