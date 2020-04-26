import { TranslationRepository } from "../../../src/models/Translation";
import { MissingTranslationError } from "../../../src/models/Translation/Errors";

describe("TranslationRepository", () => {
  it("get an array with the key - values of the path", () => {
    expect(
      TranslationRepository.translate("applicantProfileTitle")
    ).toEqual([
      { key: "title", value: "Mi Perfil" },
      { key: "subtitle", value: "Así se va a mostrar un postulante una empresa" }
    ]);
  });

  it("throw an error if the path is incorrect", () => {
    const path = "something.that.does_not_exist";
    expect(
      () => TranslationRepository.translate(path)
    ).toThrow(MissingTranslationError.buildMessage(path));
  });

});
