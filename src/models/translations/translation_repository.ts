import { defaultTranslations } from "./default_translations";
import get from "lodash/get";

export const TranslationRepository = {
  /**
   * Fetches a translation from default_translations.ts
   * given a dot-separated path (eg: "home.welcome").
   */
  translate: (path: string) => {
    const translation = get(defaultTranslations, path);
    if (translation === undefined) throw new Error(`Missing translation: ${path}`);
    return translation;
  }
};
