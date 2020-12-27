import { defaultTranslations } from "./defaultTranslations";
import { MissingTranslationError } from "./Errors";
import get from "lodash/get";

export const TranslationRepository = {
  translate: <Translation = object>(translationGroup: string) => {
    const translation = get(defaultTranslations, translationGroup) as Translation;
    if (translation === undefined) throw new MissingTranslationError(translationGroup);
    return translation;
  }
};
