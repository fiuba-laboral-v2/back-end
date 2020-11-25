import { TranslationRepository } from "$models/Translation";
import { MissingTranslationError } from "$models/Translation/Errors";

describe("TranslationRepository", () => {
  it("returns the translations that belong to the given translationGroup", () => {
    const translations = TranslationRepository.translate("applicantProfileTitle");
    expect(translations).toEqual({
      title: "Mi Perfil",
      subtitle: "Así lo va a ver una empresa"
    });
  });

  it("throws an error if translationGroup does not exist", () => {
    const translationGroup = "somethingThatDoesNotExist";
    expect(() => TranslationRepository.translate(translationGroup)).toThrow(
      MissingTranslationError.buildMessage(translationGroup)
    );
  });
});
