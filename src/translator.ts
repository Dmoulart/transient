import { AnalyzeResult } from "./analyzer";
export type TranslatorConfig<T> = {
  dest: string;
  write?: (result: T[], dest: string) => void;
  translate(components: AnalyzeResult): T[];
};

export type TranslationConfig = {
  components: AnalyzeResult;
};

export function defineTranslator<T>({
  dest,
  translate,
  write,
}: TranslatorConfig<T>) {
  return ({ components }) => {
    const translatedComponents = translate(components);

    if (dest && write) {
      write(translatedComponents, dest);
    }

    return translatedComponents;
  };
}
