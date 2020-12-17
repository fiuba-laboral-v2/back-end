import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferApprovalEvent, OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { OfferApprovalEventNotFoundError } from "$models/Offer/OfferApprovalEvent/Errors";
import { ForeignKeyConstraintError } from "sequelize";
import { Admin, Offer } from "$models";

import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";

import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

import { OfferGenerator } from "$test/generators/Offer";
import { UUID } from "$models/UUID";

describe("OfferApprovalEventRepository", () => {
  let offer: Offer;
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    const company = await CompanyGenerator.instance.withCompleteData();
    offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
    admin = await AdminGenerator.extension();
  });

  const expectValidCreationWithStatus = async (status: ApprovalStatus) => {
    const attributes = {
      status,
      offerUuid: offer.uuid,
      adminUserUuid: admin.userUuid,
      moderatorMessage: "message"
    };
    const event = new OfferApprovalEvent(attributes);
    await OfferApprovalEventRepository.save(event);
    const persistedEvent = await OfferApprovalEventRepository.findByUuid(event.uuid);
    expect(persistedEvent).toBeObjectContaining({ uuid: event.uuid, ...attributes });
  };

  it("saves a valid OfferApprovalEvent with approved status", async () => {
    await expectValidCreationWithStatus(ApprovalStatus.approved);
  });

  it("saves a valid OfferApprovalEvent with rejected status", async () => {
    await expectValidCreationWithStatus(ApprovalStatus.rejected);
  });

  it("saves a valid OfferApprovalEvent with pending status", async () => {
    await expectValidCreationWithStatus(ApprovalStatus.pending);
  });

  it("throws an error if adminUserUuid does not belong to an admin", async () => {
    const status = ApprovalStatus.approved;
    const adminUserUuid = UUID.generate();
    const offerUuid = offer.uuid;
    const event = new OfferApprovalEvent({ adminUserUuid, offerUuid, status });
    await expect(OfferApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "OfferApprovalEvents" violates ' +
        'foreign key constraint "OfferApprovalEvents_adminUserUuid_fkey"'
    );
  });

  it("throws an error if the given uuid does no belong to  persisted event", async () => {
    const uuid = UUID.generate();
    await expect(OfferApprovalEventRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      OfferApprovalEventNotFoundError,
      OfferApprovalEventNotFoundError.buildMessage(uuid)
    );
  });

  describe("Delete cascade", () => {
    const createOfferApprovalEvent = async () => {
      const { userUuid: adminUserUuid } = await AdminGenerator.extension();
      const status = ApprovalStatus.approved;
      const offerUuid = offer.uuid;
      const event = new OfferApprovalEvent({ adminUserUuid, offerUuid, status });
      return OfferApprovalEventRepository.save(event);
    };

    it("deletes all events if offers table is truncated", async () => {
      await createOfferApprovalEvent();
      await createOfferApprovalEvent();
      await createOfferApprovalEvent();
      expect((await OfferApprovalEventRepository.findAll()).length).toBeGreaterThan(0);
      await OfferRepository.truncate();
      expect(await OfferApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
