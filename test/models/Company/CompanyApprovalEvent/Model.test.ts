import { CompanyApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "../../index";

describe("CompanyApprovalEvent", () => {
  const mandatoryAttributes = {
    userUuid: UUID.generate(),
    companyUuid: UUID.generate(),
    status: ApprovalStatus.approved
  };

  it("persist a valid event", async () => {
    const event = new CompanyApprovalEvent(mandatoryAttributes);
    await expect(event.validate()).resolves.not.toThrow();
    expect(event).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...mandatoryAttributes,
      moderatorMessage: undefined
    });
  });

  it("persist an approved CompanyApprovalEvent", async () => {
    const status = ApprovalStatus.approved;
    const event = new CompanyApprovalEvent({ ...mandatoryAttributes, status });
    await expect(event.validate()).resolves.not.toThrow();
    expect(event.status).toEqual(status);
  });

  it("persist a rejected CompanyApprovalEvent", async () => {
    const status = ApprovalStatus.rejected;
    const event = new CompanyApprovalEvent({ ...mandatoryAttributes, status });
    await expect(event.validate()).resolves.not.toThrow();
    expect(event.status).toEqual(status);
  });

  it("persist a rejected event with a moderator message", async () => {
    const status = ApprovalStatus.rejected;
    const moderatorMessage = "message";
    const event = new CompanyApprovalEvent({ ...mandatoryAttributes, status, moderatorMessage });
    await expect(event.validate()).resolves.not.toThrow();
    expect(event.moderatorMessage).toEqual(moderatorMessage);
  });

  it("creates a pending event", async () => {
    const status = ApprovalStatus.pending;
    const event = new CompanyApprovalEvent({ ...mandatoryAttributes, status });
    await expect(event.validate()).resolves.not.toThrow();
    expect(event.status).toEqual(status);
  });

  it("throws and error if no userUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      companyUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.userUuid"
    );
  });

  it("throws and error if no companyUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      userUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.companyUuid"
    );
  });

  it("throws and error if no status id provided", async () => {
    const event = new CompanyApprovalEvent({
      userUuid: UUID.generate(),
      companyUuid: UUID.generate()
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.status"
    );
  });
});
