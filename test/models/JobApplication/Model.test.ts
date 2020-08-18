import { ValidationError } from "sequelize";
import { JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("JobApplication", () => {
  it("creates a valid jobApplication", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
  });

  it("sets extensionApprovalStatus in pending by default", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    expect(jobApplication.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("sets graduadosApprovalStatus in pending by default", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468"
    });
    expect(jobApplication.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a jobApplication with a rejected graduadosApprovalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      graduadosApprovalStatus: ApprovalStatus.rejected
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.graduadosApprovalStatus).toEqual(ApprovalStatus.rejected);
  });

  it("creates a jobApplication with an approved graduadosApprovalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      graduadosApprovalStatus: ApprovalStatus.approved
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.graduadosApprovalStatus).toEqual(ApprovalStatus.approved);
  });

  it("creates a jobApplication with an approved extensionApprovalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      extensionApprovalStatus: ApprovalStatus.approved
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.extensionApprovalStatus).toEqual(ApprovalStatus.approved);
  });

  it("creates a jobApplication with a rejected extensionApprovalStatus", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      extensionApprovalStatus: ApprovalStatus.rejected
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.extensionApprovalStatus).toEqual(ApprovalStatus.rejected);
  });

  it("creates a jobApplication with both status approved", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      extensionApprovalStatus: ApprovalStatus.approved,
      graduadosApprovalStatus: ApprovalStatus.approved
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.extensionApprovalStatus).toEqual(ApprovalStatus.approved);
    expect(jobApplication.graduadosApprovalStatus).toEqual(ApprovalStatus.approved);
  });

  it("creates a jobApplication with both status rejected", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      extensionApprovalStatus: ApprovalStatus.rejected,
      graduadosApprovalStatus: ApprovalStatus.rejected
    });
    await expect(jobApplication.validate()).resolves.not.toThrow();
    expect(jobApplication.extensionApprovalStatus).toEqual(ApprovalStatus.rejected);
    expect(jobApplication.graduadosApprovalStatus).toEqual(ApprovalStatus.rejected);
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
      "uuid has invalid format"
    );
  });

  it("throws an error if offerUuid has invalid format", async () => {
    const jobApplication = new JobApplication({
      applicantUuid: "f1e73c20-5992-47fc-82c9-8d87f94247ee",
      offerUuid: "invalidUuidFormat"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "uuid has invalid format"
    );
  });

  it("throws an error if extensionApprovalStatus has valid that is not in the enum", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      extensionApprovalStatus: "undefinedApprovalStatus"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "ApprovalStatus must be one of these values: pending,approved,rejected"
    );
  });

  it("throws an error if graduadosApprovalStatus has valid that is not in the enum", async () => {
    const jobApplication = new JobApplication({
      offerUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      graduadosApprovalStatus: "undefinedApprovalStatus"
    });
    await expect(jobApplication.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "ApprovalStatus must be one of these values: pending,approved,rejected"
    );
  });
});
