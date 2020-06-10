import Database from "../../../../src/config/Database";
import { CompanyApprovalEvent } from "../../../../src/models/Company/CompanyApprovalEvent";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { ValidationError } from "sequelize";
import { UUID_REGEX } from "../../index";

describe("CompanyApprovalEvent", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("creates a valid CompanyApprovalEvent", async () => {
    const companyApprovalEventAttributes = {
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      approvalStatus: ApprovalStatus.approved
    };
    const companyApprovalEvent = new CompanyApprovalEvent(companyApprovalEventAttributes);
    await expect(companyApprovalEvent.validate()).resolves.not.toThrow();
    expect(companyApprovalEvent).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      ...companyApprovalEventAttributes
    }));
  });

  it("throws and error if no adminUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      approvalStatus: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.adminUuid"
    );
  });

  it("throws and error if no companyUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      approvalStatus: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.companyUuid"
    );
  });

  it("throws and error if no approvalStatus id provided", async () => {
    const event = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27"
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.approvalStatus"
    );
  });
});
