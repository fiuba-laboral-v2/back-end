import { ForeignKeyConstraintError } from "sequelize";
import { ApplicantApprovalEventNotFoundError } from "$models/Applicant/ApplicantApprovalEvent/Errors";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";
import { ApplicantApprovalEventRepository } from "$models/Applicant/ApplicantApprovalEvent";
import { ApplicantApprovalEvent, Admin, Applicant } from "$models";

import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "../../index";

describe("ApplicantApprovalEventRepository", () => {
  let admin: Admin;
  let applicant: Applicant;

  beforeAll(async () => {
    await UserRepository.truncate();

    admin = await AdminGenerator.extension();
    applicant = await ApplicantGenerator.instance.withMinimumData();
  });

  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const attributes = { adminUserUuid: admin.userUuid, applicantUuid: applicant.uuid, status };
    const event = new ApplicantApprovalEvent(attributes);
    await ApplicantApprovalEventRepository.save(event);
    const persistedEvent = await ApplicantApprovalEventRepository.findByUuid(event.uuid);
    expect(persistedEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      moderatorMessage: null,
      ...attributes
    });
  };

  it("persists a valid pending ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.pending);
  });

  it("persists a valid approved ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.approved);
  });

  it("persists a valid rejected ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.rejected);
  });

  it("throws an error if the adminUserUuid does not belongs to an admin", async () => {
    const event = new ApplicantApprovalEvent({
      adminUserUuid: UUID.generate(),
      applicantUuid: applicant.uuid,
      status: ApprovalStatus.approved
    });
    await expect(ApplicantApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantApprovalEvents" violates foreign ' +
        'key constraint "ApplicantApprovalEvents_adminUserUuid_fkey"'
    );
  });

  it("throws an error if the applicantUuid does not belongs to an applicant", async () => {
    const event = new ApplicantApprovalEvent({
      adminUserUuid: admin.userUuid,
      applicantUuid: UUID.generate(),
      status: ApprovalStatus.approved
    });
    await expect(ApplicantApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantApprovalEvents" violates foreign' +
        ' key constraint "ApplicantApprovalEvents_applicantUuid_fkey"'
    );
  });

  it("throws an error the given uuid does not belong to a persisted event", async () => {
    const uuid = UUID.generate();
    await expect(ApplicantApprovalEventRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      ApplicantApprovalEventNotFoundError,
      ApplicantApprovalEventNotFoundError.buildMessage(uuid)
    );
  });

  describe("Delete cascade", () => {
    const createApplicantApprovalEvent = async () => {
      const event = new ApplicantApprovalEvent({
        adminUserUuid: (await AdminGenerator.extension()).userUuid,
        applicantUuid: (await ApplicantGenerator.instance.withMinimumData()).uuid,
        status: ApprovalStatus.approved
      });
      await ApplicantApprovalEventRepository.save(event);
      return event;
    };

    it("deletes all events if applicant table is truncated", async () => {
      await ApplicantApprovalEventRepository.truncate();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(4);
      await ApplicantRepository.truncate();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(0);
    });

    it("does not delete all events if admins table is truncated", async () => {
      await ApplicantApprovalEventRepository.truncate();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(4);
      await AdminRepository.truncate();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(4);
    });
  });
});
