import { ValidationError } from "sequelize";
import { ApplicantApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID_REGEX } from "../../index";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";
import { UUID } from "$models/UUID";

describe("ApplicantApprovalEvent", () => {
  const mandatoryAttributes = {
    adminUserUuid: UUID.generate(),
    applicantUuid: UUID.generate(),
    status: ApprovalStatus.approved
  };

  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const attributes = { ...mandatoryAttributes, status };
    const event = new ApplicantApprovalEvent(attributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      moderatorMessage: undefined,
      ...attributes
    });
  };

  it("creates a valid pending ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.pending);
  });

  it("creates a valid approved ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.approved);
  });

  it("creates a valid rejected ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.rejected);
  });

  it("creates a rejected event with a moderatorMessage", async () => {
    const moderatorMessage = "message";
    const attributes = { ...mandatoryAttributes, moderatorMessage };
    const event = new ApplicantApprovalEvent(attributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event.moderatorMessage).toEqual(moderatorMessage);
  });

  it("throws an error if approvalStatus is not part of the enum values", async () => {
    const event = new ApplicantApprovalEvent({
      ...mandatoryAttributes,
      status: "notDefinedStatusInEnum"
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });

  it("throws an error if no adminUserUuid is provided", async () => {
    const event = new ApplicantApprovalEvent({
      applicantUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.adminUserUuid cannot be null"
    );
  });

  it("throws an error if no applicantUuid is provided", async () => {
    const event = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.applicantUuid cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const event = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const event = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if uuid has an invalid format", async () => {
    const event = new ApplicantApprovalEvent({ ...mandatoryAttributes, uuid: "invalidFormat" });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if adminUserUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      ...mandatoryAttributes,
      adminUserUuid: "invalidFormat"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if applicantUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      ...mandatoryAttributes,
      applicantUuid: "invalidFormat"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });
});
