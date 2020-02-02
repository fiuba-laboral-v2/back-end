import { TranslationRepository } from "../../../src/models/Translation";

test("get a root element in default transitions yml", () => {
  expect(
    TranslationRepository.translate("my_company")
  ).toEqual("Mi empresa");
});

test("throw an error if the path is incorrect", () => {
  const path = "something.that.does_not_exist";
  expect(() => {
    TranslationRepository.translate(path);
  }).toThrow(`Missing translation: ${path}`);
});

test("get a nested element in default transitions yml", () => {
  expect(
    TranslationRepository.translate("app.title")
  ).toEqual("Bolsa de trabajo");
});
