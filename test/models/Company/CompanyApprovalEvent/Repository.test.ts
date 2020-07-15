import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { Admin } from "../../../../src/models";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import {
  CompanyApprovalEventRepository
} from "../../../../src/models/Company/CompanyApprovalEvent";
import { ForeignKeyConstraintError } from "sequelize";
import { CompanyGenerator, TCompanyGenerator } from "../../../generators/Company";
import { AdminGenerator, TAdminGenerator } from "../../../generators/Admin";

describe("CompanyApprovalEventRepository", () => {
  let companies: TCompanyGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    companies = CompanyGenerator.instance.withCompleteData();
    admins = AdminGenerator.instance();
  });

  describe("create", () => {
    const expectValidCreation = async (status: ApprovalStatus) => {
      const company = await companies.next().value;
      const admin = await admins.next().value;
      const adminUserUuid = admin.userUuid;
      const event = await CompanyApprovalEventRepository.create({ adminUserUuid, company, status });
      expect(event.userUuid).toEqual(admin.userUuid);
      expect(event.companyUuid).toEqual(company.uuid);
      expect(event.status).toEqual(status);
    };

    it("creates a valid CompanyApprovalEvent with approved status", async () => {
      await expectValidCreation(ApprovalStatus.approved);
    });

    it("creates a valid CompanyApprovalEvent with rejected status", async () => {
      await expectValidCreation(ApprovalStatus.rejected);
    });

    it("creates a valid CompanyApprovalEvent with pending status", async () => {
      await expectValidCreation(ApprovalStatus.pending);
    });

    it("throws an error if userUuid does not belong to an admin", async () => {
      const company = await companies.next().value;
      const [userCompany] = await company.getUsers();
      const { userUuid: adminUserUuid } = new Admin({ userUuid: userCompany.uuid });
      const status = ApprovalStatus.approved;
      await expect(
        CompanyApprovalEventRepository.create({ adminUserUuid, company, status })
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        "insert or update on table \"CompanyApprovalEvents\" violates " +
        "foreign key constraint \"CompanyApprovalEvents_userUuid_fkey\""
      );
    });

    it("gets company and admin by association", async () => {
      const company = await companies.next().value;
      const admin = await admins.next().value;
      const status = ApprovalStatus.approved;
      const adminUserUuid = admin.userUuid;
      const event = await CompanyApprovalEventRepository.create({ adminUserUuid, company, status });
      expect((await event.getCompany()).toJSON()).toEqual(company.toJSON());
      expect((await event.getAdmin()).toJSON()).toEqual(admin.toJSON());
    });
  });

  describe("Delete cascade", () => {
    const createCompanyApprovalEvent = async () => {
      const company = await companies.next().value;
      const { userUuid: adminUserUuid } = await admins.next().value;
      const status = ApprovalStatus.approved;
      return CompanyApprovalEventRepository.create({ adminUserUuid, company, status });
    };

    it("deletes all events if companies tables is truncated", async () => {
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      expect((await CompanyApprovalEventRepository.findAll()).length).toBeGreaterThan(0);
      await CompanyRepository.truncate();
      expect(await CompanyApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
