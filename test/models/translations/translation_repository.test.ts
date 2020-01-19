import { TranslationRepository } from "../../../src/models/translations";

describe("TranslationRepository", () => {
  describe("translate", () => {
    test("it gets a root element in default transitions yml", () => {
      expect(
        TranslationRepository.translate("job_board")
      ).toEqual("Bolsa de trabajo");
    });

    test("it throws an error if the path is incorrect", () => {
      const path = "something.that.does_not_exist";
      expect(() => {
        TranslationRepository.translate(path);
      }).toThrow(`Missing translation: ${path}`);
    });

    test("it gets a nested element in default transitions yml", () => {
      expect(
        TranslationRepository.translate("applicant.apply")
      ).toEqual("Postularme");
    });
  });
});
