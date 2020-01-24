import { TranslationRepository } from "$models/Translation";

test("get a root element in default transitions yml", () => {
  expect(
    TranslationRepository.translate("job_board")
  ).toEqual("Bolsa de trabajo");
});

test("throw an error if the path is incorrect", () => {
  const path = "something.that.does_not_exist";
  expect(() => {
    TranslationRepository.translate(path);
  }).toThrow(`Missing translation: ${path}`);
});

test("get a nested element in default transitions yml", () => {
  expect(
    TranslationRepository.translate("applicant.apply")
  ).toEqual("Postularme");
});
