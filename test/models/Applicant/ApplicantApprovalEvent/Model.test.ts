import Database from "../../../../src/config/Database";
import { ValidationError } from "sequelize";
import { ApplicantApprovalEvent } from "../../../../src/models/Applicant/ApplicantApprovalEvent";
import { ApprovalStatus, approvalStatuses } from "../../../../src/models/ApprovalStatus";
import { UUID_REGEX } from "../../index";

describe("ApplicantApprovalEvent", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const applicantApprovalEventAttributes = {
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status
    };
    const applicantApprovalEvent = new ApplicantApprovalEvent(applicantApprovalEventAttributes);
    await expect(applicantApprovalEvent.validate()).resolves.not.toThrow();
    expect(applicantApprovalEvent).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...applicantApprovalEventAttributes
    }));
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
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: "notDefinedStatusInEnum"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `ApprovalStatus must be one of these values: ${approvalStatuses}`
    );
  });

  it("throws an error if no userUuid is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.userUuid cannot be null"
    );
  });

  it("throws an error if no applicantUuid is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.applicantUuid cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if no status is provided", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27"
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: ApplicantApprovalEvent.status cannot be null"
    );
  });

  it("throws an error if uuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      uuid: "invalidFormat",
      userUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "uuid has invalid format"
    );
  });

  it("throws an error if userUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      userUuid: "invalidFormat",
      applicantUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "uuid has invalid format"
    );
  });

  it("throws an error if applicantUuid has an invalid format", async () => {
    const applicantApprovalEvent = new ApplicantApprovalEvent({
      userUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      applicantUuid: "invalidFormat",
      status: ApprovalStatus.approved
    });
    await expect(applicantApprovalEvent.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "uuid has invalid format"
    );
  });
});
