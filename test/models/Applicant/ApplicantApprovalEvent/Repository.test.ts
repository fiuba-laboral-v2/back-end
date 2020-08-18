import { ForeignKeyConstraintError } from "sequelize";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { AdminRepository, Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import {
  ApplicantApprovalEventRepository,
  ICreateApplicantApprovalEvent
} from "$models/Applicant/ApplicantApprovalEvent";

import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "../../index";

describe("ApplicantApprovalEventRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
  });

  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
    const applicantApprovalEventAttributes: ICreateApplicantApprovalEvent = {
      adminUserUuid: admin.userUuid,
      applicantUuid: applicant.uuid,
      status
    };
    const applicantApprovalEvent = await ApplicantApprovalEventRepository.create(
      applicantApprovalEventAttributes
    );
    expect(applicantApprovalEvent).toEqual(
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        ...applicantApprovalEventAttributes
      })
    );
  };

  it("creates a valid pending ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.pending);
  });

  it("creates a valid approved ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.approved);
  });

  it("creates a valid rejected ApplicantApprovalEvent", async () => {
    await expectToCreateAValidInstanceWithAStatus(ApprovalStatus.rejected);
  });

  it("gets applicant by association", async () => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
    const applicantApprovalEvent = await ApplicantApprovalEventRepository.create({
      adminUserUuid: admin.userUuid,
      applicantUuid: applicant.uuid,
      status: ApprovalStatus.approved
    });
    expect((await applicantApprovalEvent.getApplicant()).toJSON()).toEqual(applicant.toJSON());
  });

  it("gets admin by association", async () => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
    const applicantApprovalEvent = await ApplicantApprovalEventRepository.create({
      adminUserUuid: admin.userUuid,
      applicantUuid: applicant.uuid,
      status: ApprovalStatus.approved
    });
    expect((await applicantApprovalEvent.getAdmin()).toJSON()).toEqual(admin.toJSON());
  });

  it("throws an error if the adminUserUuid does not belongs to an admin", async () => {
    const applicant = await ApplicantGenerator.instance.withMinimumData();
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    await expect(
      ApplicantApprovalEventRepository.create({
        adminUserUuid: randomUuid,
        applicantUuid: applicant.uuid,
        status: ApprovalStatus.approved
      })
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantApprovalEvents" violates foreign ' +
        'key constraint "ApplicantApprovalEvents_adminUserUuid_fkey"'
    );
  });

  it("throws an error if the applicantUuid does not belongs to an applicant", async () => {
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
    await expect(
      ApplicantApprovalEventRepository.create({
        adminUserUuid: admin.userUuid,
        applicantUuid: randomUuid,
        status: ApprovalStatus.approved
      })
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantApprovalEvents" violates foreign' +
        ' key constraint "ApplicantApprovalEvents_applicantUuid_fkey"'
    );
  });
  describe("Delete cascade", () => {
    const createApplicantApprovalEvent = async () => {
      const admin = await AdminGenerator.instance({ secretary: Secretary.extension });
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      return ApplicantApprovalEventRepository.create({
        adminUserUuid: admin.userUuid,
        applicantUuid: applicant.uuid,
        status: ApprovalStatus.approved
      });
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

    it("deletes all events if admins table is truncated", async () => {
      await ApplicantApprovalEventRepository.truncate();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      await createApplicantApprovalEvent();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(4);
      await AdminRepository.truncate();
      expect(await ApplicantApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
