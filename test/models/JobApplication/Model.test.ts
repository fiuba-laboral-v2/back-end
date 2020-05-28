import { ValidationError } from "sequelize";
import Database from "../../../src/config/Database";
import { JobApplication } from "../../../src/models/JobApplication";

describe("JobApplication", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  describe("Valid create", () => {
    it("should create a valid jobApplication", async () => {
      const jobApplication = new JobApplication({
        offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
        applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
      });
      await expect(jobApplication.validate()).resolves.not.toThrow();
    });
  });

  describe("Errors", () => {
    it("should throw an error if no offerUuid is provided", async () => {
      const jobApplication = new JobApplication({
        offerUuid: null,
        applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
      });
      await expect(jobApplication.validate()).rejects.toThrow(ValidationError);
    });

    it("should throw an error if no applicantUuid is provided", async () => {
      const jobApplication = new JobApplication({
        offerUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee",
        applicantUuid: null
      });
      await expect(
        jobApplication.validate()
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: JobApplication.applicantUuid cannot be null"
      );
    });
  });
});
