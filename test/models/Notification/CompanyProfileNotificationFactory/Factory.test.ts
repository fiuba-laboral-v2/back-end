import { CompanyProfileNotificationFactory } from "$models/Notification";
import { Admin, Company } from "$models";
import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { UUID } from "$models/UUID";
import { CuitGenerator } from "$generators/Cuit";

describe("CompanyProfileNotificationFactory", () => {
  const factory = CompanyProfileNotificationFactory;
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
  });

  describe("Approved company", () => {
    beforeAll(() => company.set({ approvalStatus: ApprovalStatus.approved }));

    it("returns an array with an ApprovedProfileCompanyNotification", () => {
      const notifications = factory.create(company, admin);
      const [notification] = notifications;

      expect(notifications).toHaveLength(1);
      expect(notification).toBeInstanceOf(ApprovedProfileCompanyNotification);
    });

    it("returns an array with the correct attributes", () => {
      const notifications = factory.create(company, admin);

      expect(notifications).toEqual([
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          isNew: true,
          createdAt: undefined
        }
      ]);
    });
  });

  describe("Rejected company", () => {
    beforeAll(() => company.set({ approvalStatus: ApprovalStatus.rejected }));

    it("returns an empty array", () => {
      const notifications = factory.create(company, admin);
      expect(notifications).toEqual([]);
    });
  });

  describe("Pending company", () => {
    beforeAll(() => company.set({ approvalStatus: ApprovalStatus.pending }));

    it("returns an empty array", () => {
      const notifications = factory.create(company, admin);
      expect(notifications).toEqual([]);
    });
  });
});
