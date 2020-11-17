import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { UuidGenerator } from "$models/UuidGenerator";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { NotificationRepository } from "$models/Notification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { Admin, Company, JobApplication } from "$models";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { JobApplicationRepository } from "$models/JobApplication";
import { CompanyNotificationNotFoundError } from "$models/CompanyNotification/Errors";

describe("NotificationRepository", () => {
  let extensionAdmin: Admin;
  let company: Company;
  let jobApplication: JobApplication;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await NotificationRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
    extensionAdmin = await AdminGenerator.extension();
    company = await CompanyGenerator.instance.withMinimumData();
    jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
  });

  const expectToThrowErrorOnForeignKeyConstraint = async (attributeName: string) => {
    const attributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true,
      createdAt: new Date()
    };
    attributes[attributeName] = UuidGenerator.generate();
    const notification = new CompanyNewJobApplicationNotification(attributes);
    await expect(CompanyNotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "CompanyNotifications" violates foreign key ' +
        `constraint "CompanyNotifications_${attributeName}_fkey"`
    );
  };

  it("saves a CompanyNewJobApplicationNotification in the database", async () => {
    const attributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true,
      createdAt: new Date()
    };
    const notification = new CompanyNewJobApplicationNotification(attributes);
    await CompanyNotificationRepository.save(notification);
    const savedNotification = await CompanyNotificationRepository.findByUuid(notification.uuid);
    expect(savedNotification).toEqual(notification);
  });

  it("throw an error if the notification already exist", async () => {
    const attributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true,
      createdAt: new Date()
    };
    const notification = new CompanyNewJobApplicationNotification(attributes);
    await CompanyNotificationRepository.save(notification);
    await expect(CompanyNotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      UniqueConstraintError,
      "Validation error"
    );
  });

  it("throw an error if the jobApplicationUuid does not belong to an existing one", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("jobApplicationUuid");
  });

  it("throw an error if the moderatorUuid does not belong to an existing admin", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("moderatorUuid");
  });

  it("throw an error if the notifiedCompanyUuid does not belong to an existing company", async () => {
    await expectToThrowErrorOnForeignKeyConstraint("notifiedCompanyUuid");
  });

  it("throws an error if the uuid does not belong to a persisted notification", async () => {
    const uuid = UuidGenerator.generate();
    await expect(CompanyNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyNotificationNotFoundError,
      CompanyNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("Delete Cascade", () => {
    const attributes = () => ({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true,
      createdAt: new Date()
    });

    it("deletes all notifications if JobApplications table is truncated", async () => {
      await CompanyNotificationRepository.truncate();
      const firstNotification = new CompanyNewJobApplicationNotification(attributes());
      const secondNotification = new CompanyNewJobApplicationNotification(attributes());
      await CompanyNotificationRepository.save(firstNotification);
      await CompanyNotificationRepository.save(secondNotification);
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await CompanyNotificationRepository.findAll()).toHaveLength(0);
    });
  });
});
