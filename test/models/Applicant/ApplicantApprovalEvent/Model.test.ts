import { ValidationError } from "sequelize";
import { ApplicantApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID_REGEX } from "../../index";
import { isApprovalStatus, isUuid } from "$models/SequelizeModelValidators";
import { UUID } from "$models/UUID";

describe("ApplicantApprovalEvent", () => {
  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const applicantApprovalEventAttributes = {
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate(),
      status
    };
    const applicantApprovalEvent = new ApplicantApprovalEvent(applicantApprovalEventAttributes);
    await expect(applicantApprovalEvent.validate()).resolves.not.toThrow();
    expect(applicantApprovalEvent).toEqual(
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        ...applicantApprovalEventAttributes
      })
    );
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

  it("throws an error if approvalStatus is not part of the enum values", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate(),
      status: "notDefinedStatusInEnum"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });

  it("throws an error if no adminUserUuid is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      applicantUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.adminUserUuid cannot be null"
    );
  });

  it("throws an error if no applicantUuid is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.applicantUuid cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if uuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      uuid: "invalidFormat",
      adminUserUuid: UUID.generate(),
      applicantUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if adminUserUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: "invalidFormat",
      applicantUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("throws an error if applicantUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: "invalidFormat",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });
});
