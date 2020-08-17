import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { ForeignKeyConstraintError } from "sequelize";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";
import { Secretary } from "$models/Admin";
import { OfferRepository } from "$models/Offer";
import { OfferGenerator } from "$test/generators/Offer";

describe("OfferApprovalEventRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await OfferRepository.truncate();
  });
  const offersGenerator = OfferGenerator.instance.withObligatoryData();

  describe("create", () => {
    const expectValidCreation = async (status: ApprovalStatus) => {
      const company = await CompanyGenerator.instance.withCompleteData();
      const admin = await AdminGenerator.instance(Secretary.extension);
      const offer = await (await offersGenerator).next({ companyUuid: company.uuid }).value;
      const adminUserUuid = admin.userUuid;
      const event = await OfferApprovalEventRepository.create({
        adminUserUuid,
        offer,
        status
      });
      expect(event.adminUserUuid).toEqual(admin.userUuid);
      expect(event.offerUuid).toEqual(offer.uuid);
      expect(event.status).toEqual(status);
    };

    it("creates a valid OfferApprovalEvent with approved status", async () => {
      await expectValidCreation(ApprovalStatus.approved);
    });

    it("creates a valid OfferApprovalEvent with rejected status", async () => {
      await expectValidCreation(ApprovalStatus.rejected);
    });

    it("creates a valid OfferApprovalEvent with pending status", async () => {
      await expectValidCreation(ApprovalStatus.pending);
    });

    it("throws an error if userUuid does not belong to an admin", async () => {
      const company = await CompanyGenerator.instance.withCompleteData();
      const [userCompany] = await company.getUsers();
      const { userUuid: adminUserUuid } = new Admin({
        userUuid: userCompany.uuid
      });
      const offer = await (await offersGenerator).next({ companyUuid: company.uuid }).value;
      const status = ApprovalStatus.approved;
      await expect(
        OfferApprovalEventRepository.create({
          adminUserUuid,
          offer,
          status
        })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "OfferApprovalEvents" violates ' +
          'foreign key constraint "OfferApprovalEvents_adminUserUuid_fkey"'
      );
    });

    it("gets offer and admin by association", async () => {
      const company = await CompanyGenerator.instance.withCompleteData();
      const admin = await AdminGenerator.instance(Secretary.extension);
      const status = ApprovalStatus.approved;
      const adminUserUuid = admin.userUuid;
      const offer = await (await offersGenerator).next({ companyUuid: company.uuid }).value;
      const event = await OfferApprovalEventRepository.create({
        adminUserUuid,
        offer,
        status
      });

      expect((await event.getOffer()).toJSON()).toEqual(offer.toJSON());
      expect((await event.getAdmin()).toJSON()).toEqual(admin.toJSON());
    });
  });

  describe("Delete cascade", () => {
    const createOfferApprovalEvent = async () => {
      const company = await CompanyGenerator.instance.withCompleteData();
      const { userUuid: adminUserUuid } = await AdminGenerator.instance(Secretary.extension);
      const status = ApprovalStatus.approved;
      const offer = await (await offersGenerator).next({ companyUuid: company.uuid }).value;
      return OfferApprovalEventRepository.create({
        adminUserUuid,
        offer,
        status
      });
    };

    it("deletes all events if companies tables is truncated", async () => {
      await createOfferApprovalEvent();
      await createOfferApprovalEvent();
      await createOfferApprovalEvent();
      expect((await OfferApprovalEventRepository.findAll()).length).toBeGreaterThan(0);
      await OfferRepository.truncate();
      expect(await OfferApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
