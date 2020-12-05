import { OfferNotificationFactory } from "$models/Notification/OfferNotificationFactory";
import { UUID } from "$models/UUID";
import { Admin, Company, Offer } from "$models";
import { Secretary } from "$models/Admin";

import { CuitGenerator } from "$generators/Cuit";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("OfferNotificationFactory", () => {
  let offer: Offer;
  let admin: Admin;
  let company: Company;

  beforeAll(() => {
    admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    company = new Company({
      uuid: UUID.generate(),
      cuit: CuitGenerator.generate(),
      companyName: "companyName",
      businessName: "businessName"
    });

    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid }));
  });

  it("returns an array with an ApprovedOfferCompanyNotification for extension admin", async () => {
    offer.set({ extensionApprovalStatus: ApprovalStatus.approved });
    admin.set({ secretary: Secretary.extension });

    const notifications = OfferNotificationFactory.create(offer, admin);
    expect(notifications).toEqual([
      {
        uuid: undefined,
        moderatorUuid: admin.userUuid,
        notifiedCompanyUuid: company.uuid,
        offerUuid: offer.uuid,
        isNew: true,
        createdAt: undefined
      }
    ]);
  });

  it("returns an array with an ApprovedOfferCompanyNotification for graduados admin", async () => {
    offer.set({ graduadosApprovalStatus: ApprovalStatus.approved });
    admin.set({ secretary: Secretary.graduados });

    const notifications = OfferNotificationFactory.create(offer, admin);
    expect(notifications).toEqual([
      {
        uuid: undefined,
        moderatorUuid: admin.userUuid,
        notifiedCompanyUuid: company.uuid,
        offerUuid: offer.uuid,
        isNew: true,
        createdAt: undefined
      }
    ]);
  });

  it("returns an empty array if the offer is rejected for extension admin", async () => {
    offer.set({ extensionApprovalStatus: ApprovalStatus.rejected });
    admin.set({ secretary: Secretary.extension });
    expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
  });

  it("returns an empty array if the offer is pending for extension admin", async () => {
    offer.set({ extensionApprovalStatus: ApprovalStatus.pending });
    admin.set({ secretary: Secretary.extension });
    expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
  });

  it("returns an empty array if the offer is rejected for graduados admin", async () => {
    offer.set({ graduadosApprovalStatus: ApprovalStatus.rejected });
    admin.set({ secretary: Secretary.graduados });
    expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
  });

  it("returns an empty array if the offer is pending for graduados admin", async () => {
    offer.set({ graduadosApprovalStatus: ApprovalStatus.pending });
    admin.set({ secretary: Secretary.graduados });
    expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
  });
});
