import { TranslationRepository } from "$models/translations";

describe("TranslationRepository", () => {
  describe("translate", () => {
    test("it gets a root element in default transitions yml", () => {
      expect(TranslationRepository.translate("job_board")).toEqual("Bolsa de trabajo");
    });
  });
});
