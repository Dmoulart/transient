import { write } from "fs";
import { ComponentsApiMap } from "./analyzer";

export type TranslatorConfig<T> = {
  dest: string;
  write?: (result: T[], dest: string) => void;
  translate(components: ComponentsApiMap): T[];
};

export type TranslationConfig = {
  components: ComponentsApiMap;
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
