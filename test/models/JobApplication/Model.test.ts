import { ValidationError } from "sequelize";
import { JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";
import { UUID_REGEX } from "$test/models";

describe("JobApplication", () => {
  it("creates a valid jobApplication", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
  });

  it("generates a new uuid", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    expect(jobApplication.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("sets approvalStatus in pending by default", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    expect(jobApplication.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a jobApplication with a rejected approvalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      approvalStatus: ApprovalStatus.rejected
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.approvalStatus).toEqual(ApprovalStatus.rejected);
  });

  it("creates a jobApplication with an approved approvalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      approvalStatus: ApprovalStatus.approved
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.approvalStatus).toEqual(ApprovalStatus.approved);
  });

  it("throws an error if no offerUuid is provided", async () => {
    const jobApplication = new JobApplication({
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    await expect(jobApplication.validate()).rejects.toThrow(ValidationError);
  });

  it("throws an error if no applicantUuid is provided", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: JobApplication.applicantUuid cannot be null"
    );
  });

  it("throws an error if no applicantUuid is provided", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: JobApplication.applicantUuid cannot be null"
    );
  });

  it("throws an error if applicantUuid has invalid format", async () => {
    const jobApplication = new JobApplication({
      applicantUuid: "invalidUuidFormat",
      offerUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if offerUuid has invalid format", async () => {
    const jobApplication = new JobApplication({
      applicantUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee",
      offerUuid: "invalidUuidFormat"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if approvalStatus has an invalid value", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      approvalStatus: "undefinedApprovalStatus"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });
});
