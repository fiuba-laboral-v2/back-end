import { defaultTranslations } from "./defaultTranslations";
import { MissingTranslationError } from "./Errors";
import get from "lodash/get";

export const TranslationRepository = {
  /**
   * Fetches a translation from default_translations.ts
   * given a dot-separated path (eg: "home.welcome").
   */
  translate: (translationGroup: string) => {
    const translation = get(defaultTranslations, translationGroup);
    if (translation === undefined) throw new MissingTranslationError(translationGroup);
    return translation;
  }
};
