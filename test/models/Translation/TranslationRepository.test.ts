import { TranslationRepository } from "../../../src/models/Translation";

describe("TranslationRepository", () => {
  it("get a root element in default transitions yml", () => {
    expect(
      TranslationRepository.translate("companies")
    ).toEqual("Empresas");
  });

  it("throw an error if the path is incorrect", () => {
    const path = "something.that.does_not_exist";
    expect(() => {
      TranslationRepository.translate(path);
    }).toThrow(`Missing translation: ${path}`);
  });

  it("get a nested element in default transitions yml", () => {
    expect(
      TranslationRepository.translate("app.title")
    ).toEqual("Bolsa de trabajo");
  });
});
