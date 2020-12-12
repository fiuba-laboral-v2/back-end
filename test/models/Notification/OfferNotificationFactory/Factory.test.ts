import { OfferNotificationFactory } from "$models/Notification/OfferNotificationFactory";
import { UUID } from "$models/UUID";
import { Admin, Company, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import {
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification
} from "$models/CompanyNotification";
import { Secretary } from "$models/Admin";

import { CuitGenerator } from "$generators/Cuit";
import { OfferGenerator } from "$generators/Offer";

describe("OfferNotificationFactory", () => {
  const moderatorMessage = "message";
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

  describe("Graduados admin", () => {
    beforeAll(() => admin.set({ secretary: Secretary.graduados }));

    describe("Approved Offer", () => {
      beforeAll(() => offer.set({ graduadosApprovalStatus: ApprovalStatus.approved }));

      it("returns an array with an ApprovedOfferCompanyNotification if the offer is approved", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin);
        expect(notifications).toHaveLength(1);
        const [notification] = notifications;
        expect(notification).toBeInstanceOf(ApprovedOfferCompanyNotification);
      });

      it("returns an array with the correct attributes", async () => {
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
    });

    describe("Rejected Offer", () => {
      beforeAll(() => offer.set({ graduadosApprovalStatus: ApprovalStatus.rejected }));

      it("returns an array with a RejectedOfferCompanyNotification", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin, moderatorMessage);
        const [notification] = notifications;

        expect(notifications).toHaveLength(1);
        expect(notification).toBeInstanceOf(RejectedOfferCompanyNotification);
      });

      it("returns an array with the correct attributes", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin, moderatorMessage);
        expect(notifications).toEqual([
          {
            uuid: undefined,
            moderatorUuid: admin.userUuid,
            notifiedCompanyUuid: company.uuid,
            offerUuid: offer.uuid,
            moderatorMessage,
            isNew: true,
            createdAt: undefined
          }
        ]);
      });

      it("throws an error if no moderatorMessage is provided", async () => {
        expect(() => OfferNotificationFactory.create(offer, admin)).toThrowError(
          "moderatorMessage must be present"
        );
      });
    });

    it("returns an empty array if the offer is pending", async () => {
      offer.set({ graduadosApprovalStatus: ApprovalStatus.pending });
      expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
    });
  });

  describe("Extension admin", () => {
    beforeAll(() => admin.set({ secretary: Secretary.extension }));

    describe("Approved Offer", () => {
      beforeAll(() => offer.set({ extensionApprovalStatus: ApprovalStatus.approved }));

      it("returns an array with an ApprovedOfferCompanyNotification", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin);
        const [notification] = notifications;
        expect(notifications).toHaveLength(1);
        expect(notification).toBeInstanceOf(ApprovedOfferCompanyNotification);
      });

      it("returns an array with the correct attributes", async () => {
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
    });

    describe("Rejected Offer", () => {
      beforeAll(() => offer.set({ extensionApprovalStatus: ApprovalStatus.rejected }));

      it("returns an array with an RejectedOfferCompanyNotification", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin, moderatorMessage);
        const [notification] = notifications;
        expect(notifications).toHaveLength(1);
        expect(notification).toBeInstanceOf(RejectedOfferCompanyNotification);
      });

      it("returns an array with the correct attributes", async () => {
        const notifications = OfferNotificationFactory.create(offer, admin, moderatorMessage);
        expect(notifications).toEqual([
          {
            uuid: undefined,
            moderatorUuid: admin.userUuid,
            notifiedCompanyUuid: company.uuid,
            offerUuid: offer.uuid,
            moderatorMessage,
            isNew: true,
            createdAt: undefined
          }
        ]);
      });

      it("throws an error if no moderatorMessage is provided", async () => {
        expect(() => OfferNotificationFactory.create(offer, admin)).toThrowError(
          "moderatorMessage must be present"
        );
      });
    });

    it("returns an empty array if the offer is pending for extension admin", async () => {
      offer.set({ extensionApprovalStatus: ApprovalStatus.pending });
      expect(OfferNotificationFactory.create(offer, admin)).toEqual([]);
    });
  });
});
