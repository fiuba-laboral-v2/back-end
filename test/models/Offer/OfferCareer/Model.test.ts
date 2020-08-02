import { ValidationError } from "sequelize";
import { OfferCareer } from "../../../../src/models";

describe("OfferCareer", () => {
  describe("Valid create", () => {
    it("should create a valid offer career", async () => {
      const offerCareer = new OfferCareer({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        careerCode: "00608d97-0603-4127-825b-d8e40f6e8ccd"
      });
      await expect(offerCareer.validate()).resolves.not.toThrow();
    });
  });

  describe("Errors", () => {
    it("should throw an error if no careerCode is provided", async () => {
      const offerCareer = new OfferCareer({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      await expect(offerCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: OfferCareer.careerCode cannot be null"
      );
    });

    it("should throw an error if no offerUuid is provided", async () => {
      const offerCareer = new OfferCareer({
        careerCode: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      await expect(offerCareer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: OfferCareer.offerUuid cannot be null"
      );
    });
  });
});
