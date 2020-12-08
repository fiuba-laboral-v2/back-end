import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { MissingTranslationError } from "$models/Translation/Errors";

import { AdminGenerator } from "$generators/Admin";

describe("TranslationRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
  });

  it("returns the translations that belong to the given translationGroup", () => {
    const translations = TranslationRepository.translate("applicantProfileTitle");
    expect(translations).toEqual({
      title: "Mi Perfil",
      subtitle: "Así lo va a ver una empresa"
    });
  });

  it("returns the signature from an extension admin", async () => {
    const extensionAdmin = await AdminGenerator.extension();
    const signature = await TranslationRepository.findSignatureByAdmin(extensionAdmin.userUuid);
    expect(signature).toEqual("Bolsa de Trabajo FIUBA");
  });

  it("returns the signature from a graduados admin", async () => {
    const graduadosAdmin = await AdminGenerator.graduados();
    const signature = await TranslationRepository.findSignatureByAdmin(graduadosAdmin.userUuid);
    expect(signature).toEqual("Bolsa de Trabajo FIUBA");
  });

  it("throws an error if translationGroup does not exist", () => {
    const translationGroup = "somethingThatDoesNotExist";
    expect(() => TranslationRepository.translate(translationGroup)).toThrow(
      MissingTranslationError.buildMessage(translationGroup)
    );
  });
});
