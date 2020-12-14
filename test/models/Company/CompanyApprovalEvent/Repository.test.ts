import { ForeignKeyConstraintError } from "sequelize";
import { CompanyApprovalEventNotFoundError } from "$models/Company/CompanyApprovalEvent/Errors";
import { UUID } from "$models/UUID";
import { Admin, Company, CompanyApprovalEvent } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { CompanyRepository } from "$models/Company";
import { AdminRepository } from "$models/Admin";
import { UserRepository } from "$models/User";
import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";

import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("CompanyApprovalEventRepository", () => {
  let company: Company;
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    company = await CompanyGenerator.instance.withCompleteData();
    admin = await AdminGenerator.extension();
  });

  const expectValidCreation = async (status: ApprovalStatus) => {
    const { uuid: companyUuid } = company;
    const { userUuid } = admin;
    const event = new CompanyApprovalEvent({ userUuid, companyUuid, status });
    await CompanyApprovalEventRepository.save(event);
    const persistedEvent = await CompanyApprovalEventRepository.findByUuid(event.uuid);
    expect(persistedEvent).toBeObjectContaining({
      uuid: event.uuid,
      userUuid,
      companyUuid,
      status,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
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
    const { uuid: companyUuid } = company;
    const userUuid = UUID.generate();
    const status = ApprovalStatus.approved;
    const event = new CompanyApprovalEvent({ userUuid, companyUuid, status });
    await expect(CompanyApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "CompanyApprovalEvents" violates ' +
        'foreign key constraint "CompanyApprovalEvents_userUuid_fkey"'
    );
  });

  it("throws an error if companyUuid does not belong to a persisted company", async () => {
    const companyUuid = UUID.generate();
    const { userUuid } = admin;
    const status = ApprovalStatus.approved;
    const event = new CompanyApprovalEvent({ userUuid, companyUuid, status });
    await expect(CompanyApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "CompanyApprovalEvents" violates ' +
        'foreign key constraint "CompanyApprovalEvents_companyUuid_fkey"'
    );
  });

  it("throws an error if given an uuid that does not belong to a persisted event", async () => {
    const uuid = UUID.generate();
    await expect(CompanyApprovalEventRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyApprovalEventNotFoundError,
      CompanyApprovalEventNotFoundError.buildMessage(uuid)
    );
  });

  describe("Delete cascade", () => {
    const createCompanyApprovalEvent = async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withCompleteData();
      const { userUuid } = await AdminGenerator.extension();
      const status = ApprovalStatus.approved;
      const event = new CompanyApprovalEvent({ userUuid, companyUuid, status });
      await CompanyApprovalEventRepository.save(event);
      return event;
    };

    it("deletes all events if companies tables is truncated", async () => {
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      expect((await CompanyApprovalEventRepository.findAll()).length).toBeGreaterThan(0);
      await CompanyRepository.truncate();
      expect(await CompanyApprovalEventRepository.findAll()).toHaveLength(0);
    });

    it("deletes all events if admins tables is truncated", async () => {
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      expect((await CompanyApprovalEventRepository.findAll()).length).toBeGreaterThan(0);
      await AdminRepository.truncate();
      expect(await CompanyApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
