import { defaultTranslations } from "./defaultTranslations";
import { MissingTranslationError } from "./Errors";
import get from "lodash/get";
import { AdminRepository } from "$models/Admin";

export const TranslationRepository = {
  translate: <Translation = object>(translationGroup: string) => {
    const translation = get(defaultTranslations, translationGroup) as Translation;
    if (translation === undefined) throw new MissingTranslationError(translationGroup);
    return translation;
  },
  findSignatureByAdmin: async (adminUserUuid: string): Promise<string> => {
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const signatures = TranslationRepository.translate("emailSignature");
    return signatures[admin.secretary];
  }
};
