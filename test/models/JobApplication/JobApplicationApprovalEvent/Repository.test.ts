import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { JobApplicationsApprovalEventNotFoundError } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";
import { ApplicantRepository } from "$models/Applicant";
import { AdminRepository } from "$models/Admin";
import { Admin, JobApplicationApprovalEvent } from "$models";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ValidationError, ForeignKeyConstraintError } from "sequelize";
import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";

describe("JobApplicationApprovalEventRepository", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    admin = await AdminGenerator.extension();
  });

  const expectToCreateEventWithStatus = async (
    status: ApprovalStatus,
    jobApplicationUuid: string
  ) => {
    const attributes = {
      jobApplicationUuid,
      adminUserUuid: admin.userUuid,
      status
    };
    const event = new JobApplicationApprovalEvent(attributes);
    await JobApplicationApprovalEventRepository.save(event);
    const savedEvent = await JobApplicationApprovalEventRepository.findByUuid(event.uuid);
    expect(savedEvent).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  };

  const expectToThrowErrorOnForeignKeyFor = async (attribute: string) => {
    const { uuid: jobApplicationUuid } = await JobApplicationGenerator.instance.withMinimumData();
    const attributes = {
      jobApplicationUuid,
      adminUserUuid: admin.userUuid,
      status: ApprovalStatus.pending
    };
    attributes[attribute] = generateUuid();
    const event = new JobApplicationApprovalEvent(attributes);
    const constrain = `JobApplicationApprovalEvent_${attribute}_fkey`;
    const model = "JobApplicationApprovalEvent";
    await expect(JobApplicationApprovalEventRepository.save(event)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      `insert or update on table "${model}" violates foreign key constraint "${constrain}"`
    );
  };

  const createJobApplicationApprovalEvent = async () => {
    const { uuid: jobApplicationUuid } = await JobApplicationGenerator.instance.withMinimumData();
    const event = new JobApplicationApprovalEvent({
      jobApplicationUuid,
      adminUserUuid: admin.userUuid,
      status: ApprovalStatus.pending
    });
    return JobApplicationApprovalEventRepository.save(event);
  };

  describe("save", () => {
    it("saves an event with a pending status", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      await expectToCreateEventWithStatus(ApprovalStatus.pending, uuid);
    });

    it("saves an event with an approved status", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      await expectToCreateEventWithStatus(ApprovalStatus.approved, uuid);
    });

    it("saves an event with a rejected status", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      await expectToCreateEventWithStatus(ApprovalStatus.rejected, uuid);
    });

    it("logs events for the same applicantUuid and offerUuid", async () => {
      const { uuid } = await JobApplicationGenerator.instance.withMinimumData();
      await expectToCreateEventWithStatus(ApprovalStatus.pending, uuid);
      await expectToCreateEventWithStatus(ApprovalStatus.approved, uuid);
      await expectToCreateEventWithStatus(ApprovalStatus.rejected, uuid);
    });

    it("saves an event with a jobApplication association", async () => {
      const { uuid: jobApplicationUuid } = await JobApplicationGenerator.instance.withMinimumData();
      const event = new JobApplicationApprovalEvent({
        jobApplicationUuid,
        adminUserUuid: admin.userUuid,
        status: ApprovalStatus.pending
      });
      await JobApplicationApprovalEventRepository.save(event);
      const jobApplication = await event.getJobApplication();
      expect(jobApplication.uuid).toEqual(jobApplicationUuid);
    });

    it("saves an event with an admin association", async () => {
      const { uuid: jobApplicationUuid } = await JobApplicationGenerator.instance.withMinimumData();
      const event = new JobApplicationApprovalEvent({
        jobApplicationUuid,
        adminUserUuid: admin.userUuid,
        status: ApprovalStatus.pending
      });
      await JobApplicationApprovalEventRepository.save(event);
      const { userUuid } = await event.getAdmin();
      expect(userUuid).toEqual(admin.userUuid);
    });

    it("throws an error if the status is not an ApprovalStatus enum value", async () => {
      const { uuid: jobApplicationUuid } = await JobApplicationGenerator.instance.withMinimumData();
      const event = new JobApplicationApprovalEvent({
        jobApplicationUuid,
        adminUserUuid: admin.userUuid,
        status: "undefinedStatus" as ApprovalStatus
      });
      await expect(
        JobApplicationApprovalEventRepository.save(event)
      ).rejects.toThrowErrorWithMessage(ValidationError, isApprovalStatus.validate.isIn.msg);
    });

    it("throws an error if the adminUserUuid does not belong to an admin", async () => {
      await expectToThrowErrorOnForeignKeyFor("adminUserUuid");
    });

    it("throws an error if the jobApplicationUuid does not belong to an jobApplication", async () => {
      await expectToThrowErrorOnForeignKeyFor("jobApplicationUuid");
    });
  });

  describe("findByUuid", () => {
    it("finds an event by uuid", async () => {
      const event = await createJobApplicationApprovalEvent();
      const foundEvent = await JobApplicationApprovalEventRepository.findByUuid(event.uuid);
      expect(foundEvent.uuid).toEqual(event.uuid);
      expect(foundEvent.jobApplicationUuid).toEqual(event.jobApplicationUuid);
      expect(foundEvent.status).toEqual(event.status);
    });

    it("throws an error if the uuid does not belong to a persisted event", async () => {
      const nonPersistedEventUuid = generateUuid();
      await expect(
        JobApplicationApprovalEventRepository.findByUuid(nonPersistedEventUuid)
      ).rejects.toThrowErrorWithMessage(
        JobApplicationsApprovalEventNotFoundError,
        JobApplicationsApprovalEventNotFoundError.buildMessage(nonPersistedEventUuid)
      );
    });
  });

  describe("findAll", () => {
    it("finds all events", async () => {
      await JobApplicationApprovalEventRepository.truncate();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(4);
    });
  });

  describe("delete by cascade", () => {
    it("deletes all events by deleting offers table", async () => {
      await JobApplicationApprovalEventRepository.truncate();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(2);
      await OfferRepository.truncate();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(0);
    });

    it("deletes all events by deleting applicants table", async () => {
      await JobApplicationApprovalEventRepository.truncate();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(2);
      await ApplicantRepository.truncate();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(0);
    });

    it("deletes all events by deleting admins table", async () => {
      await JobApplicationApprovalEventRepository.truncate();
      await createJobApplicationApprovalEvent();
      await createJobApplicationApprovalEvent();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(2);
      await AdminRepository.truncate();
      expect(await JobApplicationApprovalEventRepository.findAll()).toHaveLength(0);
    });
  });
});
