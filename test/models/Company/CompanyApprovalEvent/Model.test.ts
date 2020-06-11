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
      status: ApprovalStatus.approved
    };
    const companyApprovalEvent = new CompanyApprovalEvent(companyApprovalEventAttributes);
    await expect(companyApprovalEvent.validate()).resolves.not.toThrow();
    expect(companyApprovalEvent).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...companyApprovalEventAttributes
    }));
  });

  it("creates a rejected CompanyApprovalEvent", async () => {
    const companyApprovalEvent = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.rejected
    });
    await expect(companyApprovalEvent.validate()).resolves.not.toThrow();
    await expect(companyApprovalEvent.status).toEqual(ApprovalStatus.rejected);
  });

  it("creates a pending CompanyApprovalEvent", async () => {
    const companyApprovalEvent = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.pending
    });
    await expect(companyApprovalEvent.validate()).resolves.not.toThrow();
    await expect(companyApprovalEvent.status).toEqual(ApprovalStatus.pending);
  });

  it("throws and error if no adminUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.adminUuid"
    );
  });

  it("throws and error if no companyUuid id provided", async () => {
    const event = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.companyUuid"
    );
  });

  it("throws and error if no status id provided", async () => {
    const event = new CompanyApprovalEvent({
      adminUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      companyUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27"
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyApprovalEvent.status"
    );
  });
});
