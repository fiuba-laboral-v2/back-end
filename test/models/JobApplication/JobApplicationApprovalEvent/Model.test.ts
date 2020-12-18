import { ValidationError } from "sequelize";
import { JobApplicationApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";

describe("JobApplicationApprovalEvent", () => {
  const mandatoryAttributes = {
    jobApplicationUuid: UUID.generate(),
    adminUserUuid: UUID.generate(),
    status: ApprovalStatus.pending
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    const attributes = {
      jobApplicationUuid: UUID.generate(),
      adminUserUuid: UUID.generate(),
      status: ApprovalStatus.pending
    };
    delete attributes[attribute];
    const event = new JobApplicationApprovalEvent(attributes);
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: JobApplicationApprovalEvent.${attribute} cannot be null`
    );
  };

  const expectToThrowAnErrorOnInvalidUuid = async (attribute: string) => {
    const attributes = { ...mandatoryAttributes, [attribute]: "invalidUuid" };
    const event = new JobApplicationApprovalEvent(attributes);
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  };

  it("creates a valid event with pending status", async () => {
    const status = ApprovalStatus.pending;
    const attributes = { ...mandatoryAttributes, status };
    const event = new JobApplicationApprovalEvent(attributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event).toBeObjectContaining(attributes);
  });

  it("creates a valid event with approved status", async () => {
    const status = ApprovalStatus.approved;
    const attributes = { ...mandatoryAttributes, status };
    const event = new JobApplicationApprovalEvent(attributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event).toBeObjectContaining(attributes);
  });

  it("creates a valid event with rejected status", async () => {
    const status = ApprovalStatus.rejected;
    const attributes = { ...mandatoryAttributes, status };
    const event = new JobApplicationApprovalEvent(attributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event).toBeObjectContaining(attributes);
  });

  it("creates an event with undefined timestamps", async () => {
    const event = new JobApplicationApprovalEvent(mandatoryAttributes);
    expect(event.createdAt).toBeUndefined();
    expect(event.updatedAt).toBeUndefined();
  });

  it("creates an event with a generated uuid", async () => {
    const event = new JobApplicationApprovalEvent(mandatoryAttributes);
    expect(event.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("creates an event with a moderatorMessage uuid", async () => {
    const moderatorMessage = "moderatorMessage";
    const event = new JobApplicationApprovalEvent({ ...mandatoryAttributes, moderatorMessage });
    expect(event.moderatorMessage).toEqual(moderatorMessage);
  });

  it("throws an error if no jobApplicationUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("jobApplicationUuid");
  });

  it("throws an error if no adminUserUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("adminUserUuid");
  });

  it("throws an error if no status is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("status");
  });

  it("throws an error if jobApplicationUuid has invalid format", async () => {
    await expectToThrowAnErrorOnInvalidUuid("jobApplicationUuid");
  });

  it("throws an error if adminUserUuid has invalid format", async () => {
    await expectToThrowAnErrorOnInvalidUuid("adminUserUuid");
  });

  it("throws an error if status has invalid format", async () => {
    const status = "undefinedStatus";
    const event = new JobApplicationApprovalEvent({ ...mandatoryAttributes, status });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });
});
