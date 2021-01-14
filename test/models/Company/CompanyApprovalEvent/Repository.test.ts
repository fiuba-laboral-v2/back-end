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
    const attributes = { userUuid, companyUuid, status };
    const event = new CompanyApprovalEvent(attributes);
    await CompanyApprovalEventRepository.save(event);
    const persistedEvent = await CompanyApprovalEventRepository.findByUuid(event.uuid);
    expect(persistedEvent).toBeObjectContaining({
      uuid: event.uuid,
      ...attributes,
      moderatorMessage: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  };

  it("persists a valid CompanyApprovalEvent with approved status", async () => {
    await expectValidCreation(ApprovalStatus.approved);
  });

  it("persists a valid CompanyApprovalEvent with rejected status", async () => {
    await expectValidCreation(ApprovalStatus.rejected);
  });

  it("persists a valid CompanyApprovalEvent with pending status", async () => {
    await expectValidCreation(ApprovalStatus.pending);
  });

  it("persists an event with a moderatorMessage", async () => {
    const moderatorMessage = "message";
    const event = new CompanyApprovalEvent({
      userUuid: admin.userUuid,
      companyUuid: company.uuid,
      status: ApprovalStatus.rejected,
      moderatorMessage
    });
    await CompanyApprovalEventRepository.save(event);
    const persistedEvent = await CompanyApprovalEventRepository.findByUuid(event.uuid);
    expect(persistedEvent.moderatorMessage).toEqual(moderatorMessage);
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

    it("does not delete all events if admins tables is truncated", async () => {
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      await createCompanyApprovalEvent();
      const allEvents = await CompanyApprovalEventRepository.findAll();
      expect(allEvents.length).toBeGreaterThan(0);
      await AdminRepository.truncate();
      expect(await CompanyApprovalEventRepository.findAll()).toHaveLength(allEvents.length);
    });
  });
});
