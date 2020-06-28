import Database from "../../../../src/config/Database";
import { ForeignKeyConstraintError } from "sequelize";
import { ApplicantRepository } from "../../../../src/models/Applicant";
import { AdminRepository } from "../../../../src/models/Admin";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import {
  ApplicantApprovalEventRepository,
  ICreateApplicantApprovalEvent
} from "../../../../src/models/Applicant/ApplicantApprovalEvent";

import { AdminGenerator, TAdminGenerator } from "../../../generators/Admin";
import { ApplicantGenerator, TApplicantGenerator } from "../../../generators/Applicant";
import { UUID_REGEX } from "../../index";

describe("ApplicantApprovalEventRepository", () => {
  let applicants: TApplicantGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await ApplicantRepository.truncate();
    applicants = ApplicantGenerator.withMinimumData();
    admins = AdminGenerator.instance();
  });

  afterAll(() => Database.close());

  const expectToCreateAValidInstanceWithAStatus = async (status: ApprovalStatus) => {
    const applicant = await applicants.next().value;
    const admin = await admins.next().value;
    const applicantApprovalEventAttributes: ICreateApplicantApprovalEvent = {
      adminUserUuid: admin.userUuid,
      applicantUuid: applicant.uuid,
      status
    };
    const applicantApprovalEvent = await ApplicantApprovalEventRepository.create(
      applicantApprovalEventAttributes
    );
    expect(applicantApprovalEvent).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...applicantApprovalEventAttributes
    }));
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

  it("throws an error if the adminUserUuid does not belongs to an admin", async () => {
    const applicant = await applicants.next().value;
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    await expect(
      ApplicantApprovalEventRepository.create({
        adminUserUuid: randomUuid,
        applicantUuid: applicant.uuid,
        status: ApprovalStatus.approved
      })
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      "insert or update on table \"ApplicantApprovalEvents\" violates foreign " +
      "key constraint \"ApplicantApprovalEvents_adminUserUuid_fkey\""
    );
  });

  it("throws an error if the applicantUuid does not belongs to an applicant", async () => {
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const admin = await admins.next().value;
    await expect(
      ApplicantApprovalEventRepository.create({
        adminUserUuid: admin.userUuid,
        applicantUuid: randomUuid,
        status: ApprovalStatus.approved
      })
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      "insert or update on table \"ApplicantApprovalEvents\" violates foreign" +
      " key constraint \"ApplicantApprovalEvents_applicantUuid_fkey\""
    );
  });
  describe("Delete cascade", () => {
    const createApplicantApprovalEvent = async () => {
      const admin = await admins.next().value;
      const applicant = await applicants.next().value;
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
