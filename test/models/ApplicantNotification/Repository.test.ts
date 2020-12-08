import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { ApplicantNotificationNotFoundError } from "$models/ApplicantNotification/Errors";
import { Admin, Applicant, Company, JobApplication } from "$models";
import {
  IApprovedJobApplicationAttributes,
  IApplicantNotificationAttributes,
  ApprovedJobApplicationApplicantNotification,
  ApplicantNotificationRepository,
  ApplicantNotification
} from "$models/ApplicantNotification";

import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";
import { UUID_REGEX } from "$test/models";
import { UUID } from "$models/UUID";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("ApplicantNotificationRepository", () => {
  let extensionAdmin: Admin;
  let applicant: Applicant;
  let company: Company;
  let jobApplication: JobApplication;
  let commonAttributes: IApplicantNotificationAttributes;
  let approvedApplicationProps: IApprovedJobApplicationAttributes;

  beforeAll(async () => {
    await UserRepository.truncate();
    await ApplicantRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();
    await CompanyRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
    extensionAdmin = await AdminGenerator.extension();
    applicant = await ApplicantGenerator.instance.withMinimumData();
    company = await CompanyGenerator.instance.withMinimumData();
    jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
    commonAttributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedApplicantUuid: applicant.uuid,
      isNew: true
    };
    approvedApplicationProps = { ...commonAttributes, jobApplicationUuid: jobApplication.uuid };
  });

  it("saves a ApprovedJobApplicationApplicantNotification in the database", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(approvedApplicationProps);
    await ApplicantNotificationRepository.save(notification);
    const savedNotification = await ApplicantNotificationRepository.findByUuid(notification.uuid!);
    expect(savedNotification).toEqual(savedNotification);
  });

  it("generates an uuid after it is saved", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(approvedApplicationProps);
    expect(notification.uuid).toBeUndefined();
    await ApplicantNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("generates a createdAt timestamp after it is saved", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(approvedApplicationProps);
    expect(notification.createdAt).toBeUndefined();
    await ApplicantNotificationRepository.save(notification);
    expect(notification.createdAt).toEqual(expect.any(Date));
  });

  it("updates isNew to false", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(approvedApplicationProps);
    await ApplicantNotificationRepository.save(notification);
    expect(notification.isNew).toBe(true);
    notification.isNew = false;
    await ApplicantNotificationRepository.save(notification);
    expect(notification.isNew).toBe(false);
  });

  it("throws an error if a ApprovedJobApplicationApplicantNotification already exist", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(approvedApplicationProps);
    const uuid = UUID.generate();
    jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
    await ApplicantNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(uuid);
    const anotherNotification = new ApprovedJobApplicationApplicantNotification(
      approvedApplicationProps
    );
    await expect(
      ApplicantNotificationRepository.save(anotherNotification)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throw an error if the jobApplicationUuid does not belong to an existing one", async () => {
    const attributes = { ...approvedApplicationProps, jobApplicationUuid: UUID.generate() };
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    await expect(
      ApplicantNotificationRepository.save(notification)
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantNotifications" violates foreign key ' +
        'constraint "ApplicantNotifications_jobApplicationUuid_fkey"'
    );
  });

  it("throw an error if the moderatorUuid does not belong to an existing admin", async () => {
    const attributes = { ...approvedApplicationProps, moderatorUuid: UUID.generate() };
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    await expect(
      ApplicantNotificationRepository.save(notification)
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantNotifications" violates foreign key ' +
        'constraint "ApplicantNotifications_moderatorUuid_fkey"'
    );
  });

  it("throw an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
    const attributes = { ...approvedApplicationProps, notifiedApplicantUuid: UUID.generate() };
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    await expect(
      ApplicantNotificationRepository.save(notification)
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "ApplicantNotifications" violates foreign key ' +
        'constraint "ApplicantNotifications_notifiedApplicantUuid_fkey"'
    );
  });

  it("throws an error if the uuid does not belong to a persisted notification", async () => {
    const uuid = UUID.generate();
    await expect(ApplicantNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      ApplicantNotificationNotFoundError,
      ApplicantNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("findLatestByApplicant", () => {
    const { findLatestByApplicant } = ApplicantNotificationRepository;
    let notifications: ApplicantNotification[] = [];
    const notificationsLength = 20;

    beforeAll(async () => {
      await ApplicantNotificationRepository.truncate();

      const anotherApplicant = await ApplicantGenerator.instance.withMinimumData();
      const size = notificationsLength;

      notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
      await ApplicantNotificationGenerator.instance.range({ applicant: anotherApplicant, size: 2 });
    });

    it("finds all notifications by applicant", async () => {
      const applicantUuid = applicant.uuid;
      const result = await ApplicantNotificationRepository.findLatestByApplicant({ applicantUuid });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(notificationsLength);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the first three notifications", async () => {
      const applicantUuid = applicant.uuid;
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[0].createdAt!,
        uuid: notifications[0].uuid!
      };
      const result = await findLatestByApplicant({ updatedBeforeThan, applicantUuid });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(itemsPerPage);
      expect(results).toEqual(notifications.slice(1, itemsPerPage + 1));
      expect(shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications", async () => {
      const applicantUuid = applicant.uuid;
      const itemsPerPage = notificationsLength / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[itemsPerPage - 1].createdAt!,
        uuid: notifications[itemsPerPage - 1].uuid!
      };
      const result = await findLatestByApplicant({ updatedBeforeThan, applicantUuid });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(itemsPerPage);
      expect(results).toEqual(notifications.slice(itemsPerPage, notificationsLength + 1));
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the latest notifications order by inNew first", async () => {
      const applicantUuid = applicant.uuid;
      let isNew = true;
      notifications.forEach(notification => {
        notification.isNew = !isNew;
        isNew = !isNew;
      });
      await Promise.all(
        notifications.map(notification => ApplicantNotificationRepository.save(notification))
      );
      const { shouldFetchMore, results } = await findLatestByApplicant({ applicantUuid });

      expect(results.map(result => result.isNew)).toEqual([
        ...Array(notificationsLength / 2).fill(true),
        ...Array(notificationsLength / 2).fill(false)
      ]);
      expect(shouldFetchMore).toBe(false);
    });
  });

  describe("DELETE CASCADE", () => {
    const approvedJobApplicationAttributes = () => ({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedApplicantUuid: applicant.uuid,
      jobApplicationUuid: jobApplication.uuid
    });

    it("deletes all notifications if JobApplications table is truncated", async () => {
      await ApplicantNotificationRepository.truncate();
      const attributes = approvedJobApplicationAttributes();
      const firstNotification = new ApprovedJobApplicationApplicantNotification(attributes);
      const secondNotification = new ApprovedJobApplicationApplicantNotification(attributes);
      await ApplicantNotificationRepository.save(firstNotification);
      await ApplicantNotificationRepository.save(secondNotification);
      expect(await ApplicantNotificationRepository.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await ApplicantNotificationRepository.findAll()).toHaveLength(0);
    });
  });
});
