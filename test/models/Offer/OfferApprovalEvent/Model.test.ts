import { OfferApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";

describe("OfferApprovalEvent", () => {
  const mandatoryAttributes = {
    offerUuid: UUID.generate(),
    adminUserUuid: UUID.generate(),
    status: ApprovalStatus.approved
  };

  it("creates an approved event", async () => {
    const attributes = { ...mandatoryAttributes, status: ApprovalStatus.approved };
    const offerApprovalEvent = new OfferApprovalEvent(attributes);
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    expect(offerApprovalEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("creates a rejected event", async () => {
    const attributes = { ...mandatoryAttributes, status: ApprovalStatus.rejected };
    const offerApprovalEvent = new OfferApprovalEvent(attributes);
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    expect(offerApprovalEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("creates a pending event", async () => {
    const attributes = { ...mandatoryAttributes, status: ApprovalStatus.pending };
    const offerApprovalEvent = new OfferApprovalEvent(attributes);
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    expect(offerApprovalEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("creates an event with a moderatorMessage", async () => {
    const moderatorMessage = "message";
    const attributes = { ...mandatoryAttributes, moderatorMessage };
    const offerApprovalEvent = new OfferApprovalEvent(attributes);
    await expect(offerApprovalEvent.validate()).resolves.not.toThrow();
    expect(offerApprovalEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes,
      moderatorMessage
    });
  });

  it("throws and error if no adminUserUuid id provided", async () => {
    const event = new OfferApprovalEvent({
      offerUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.adminUserUuid"
    );
  });

  it("throws and error if no offerUuid id provided", async () => {
    const event = new OfferApprovalEvent({
      adminUserUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.offerUuid"
    );
  });

  it("throws and error if no status id provided", async () => {
    const event = new OfferApprovalEvent({
      adminUserUuid: UUID.generate(),
      offerUuid: UUID.generate()
    });
    await expect(event.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: OfferApprovalEvent.status"
    );
  });
});
