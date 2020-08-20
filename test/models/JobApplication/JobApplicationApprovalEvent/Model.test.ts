import { ValidationError } from "sequelize";
import { JobApplicationApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID_REGEX } from "$test/models";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

describe("JobApplicationApprovalEvent", () => {
  const expectToCreateAValidEventWithStatus = async (status: ApprovalStatus) => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status
    });
    await expect(jobApplicationApprovalEvent.validate()).resolves.not.toThrow();
  };

  const expectToCreateAnEventWithTheGivenAttributes = async (status: ApprovalStatus) => {
    const attributes = {
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status
    };
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent(attributes);
    expect(jobApplicationApprovalEvent).toBeObjectContaining(attributes);
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    const attributes = {
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    };
    delete attributes[attribute];
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent(attributes);
    await expect(jobApplicationApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: JobApplicationApprovalEvent.${attribute} cannot be null`
    );
  };

  const expectToThrowAnErrorOnInvalidUuid = async (attribute: string) => {
    const attributes = {
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    };
    attributes[attribute] = "invalidUuid";
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent(attributes);
    await expect(jobApplicationApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  };

  it("creates a valid JobApplicationApprovalEvent with pending status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.pending);
  });

  it("creates a valid JobApplicationApprovalEvent with approved status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.approved);
  });

  it("creates a valid JobApplicationApprovalEvent with rejected status", async () => {
    await expectToCreateAValidEventWithStatus(ApprovalStatus.rejected);
  });

  it("creates an event with the given attributes and pending status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.pending);
  });

  it("creates an event with the given attributes and approved status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.approved);
  });

  it("creates an event with the given attributes and rejected status", async () => {
    await expectToCreateAnEventWithTheGivenAttributes(ApprovalStatus.rejected);
  });

  it("creates an event with undefined timestamps", async () => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    });
    expect(jobApplicationApprovalEvent.createdAt).toBeUndefined();
    expect(jobApplicationApprovalEvent.updatedAt).toBeUndefined();
  });

  it("creates an event with a generated uuid", async () => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: ApprovalStatus.pending
    });
    expect(jobApplicationApprovalEvent.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("throws an error if no offerUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("offerUuid");
  });

  it("throws an error if no applicantUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("applicantUuid");
  });

  it("throws an error if no adminUserUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("adminUserUuid");
  });

  it("throws an error if no status is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("status");
  });

  it("throws an error if offerUuid has invalid format", async () => {
    await expectToThrowAnErrorOnInvalidUuid("offerUuid");
  });

  it("throws an error if applicantUuid has invalid format", async () => {
    await expectToThrowAnErrorOnInvalidUuid("applicantUuid");
  });

  it("throws an error if adminUserUuid has invalid format", async () => {
    await expectToThrowAnErrorOnInvalidUuid("adminUserUuid");
  });

  it("throws an error if status has invalid format", async () => {
    const jobApplicationApprovalEvent = new JobApplicationApprovalEvent({
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      applicantUuid: "73f5ac38-6c5e-407c-b95e-f7a65d0dc468",
      adminUserUuid: "70aa38ee-f144-4880-94e0-3502f364bc7f",
      status: "undefinedStatus"
    });
    await expect(jobApplicationApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });
});
