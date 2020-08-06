import { OfferApprovalEvent } from "../../../../src/models";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import { ValidationError } from "sequelize";
import { UUID_REGEX } from "../../index";

describe("OfferApprovalEvent", () => {
  it("creates a valid OfferApprovalEvent", async () => {
    const offerApprovalEventAttributes = {
      adminUserUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      offerUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    };
    const offerApprovalEvent = new OfferApprovalEvent(offerApprovalEventAttributes);
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    expect(offerApprovalEvent).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...offerApprovalEventAttributes
    }));
  });

  it("creates a rejected OfferApprovalEvent", async () => {
    const offerApprovalEvent = new OfferApprovalEvent({
      adminUserUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      offerUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.rejected
    });
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    await expect(offerApprovalEvent.status).toEqual(ApprovalStatus.rejected);
  });

  it("creates a pending OfferApprovalEvent", async () => {
    const offerApprovalEvent = new OfferApprovalEvent({
      adminUserUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      offerUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.pending
    });
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    await expect(offerApprovalEvent.status).toEqual(ApprovalStatus.pending);
  });

  it("throws and error if no adminUserUuid id provided", async () => {
    const event = new OfferApprovalEvent({
      offerUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27",
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.adminUserUuid"
    );
  });

  it("throws and error if no offerUuid id provided", async () => {
    const event = new OfferApprovalEvent({
      adminUserUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.offerUuid"
    );
  });

  it("throws and error if no status id provided", async () => {
    const event = new OfferApprovalEvent({
      adminUserUuid: "cfe18465-9454-48b6-80bc-375411650d99",
      offerUuid: "290d5ff7-592b-4874-a43d-4dfc948a0f27"
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.status"
    );
  });
});
