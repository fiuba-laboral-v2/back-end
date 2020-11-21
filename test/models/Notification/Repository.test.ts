import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { Admin, Company, JobApplication, Notification, User } from "$models";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { CareerRepository } from "$models/Career";
import { NotificationRepository } from "$models/Notification";

import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { NotificationGenerator } from "$generators/Notification";
import { AdminGenerator } from "$generators/Admin";

import { UUID } from "$models/UUID";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("NotificationRepository", () => {
  let company: Company;
  let companyUsers: User[];
  let jobApplication: JobApplication;
  let companyUserUuid: string;
  let extensionAdmin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await NotificationRepository.truncate();
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();

    company = await CompanyGenerator.instance.withMinimumData();
    companyUsers = await company.getUsers();

    jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
    const [user] = companyUsers;
    companyUserUuid = user.uuid;
    extensionAdmin = await AdminGenerator.extension();
  });

  it("saves a notification in the database", async () => {
    const notification = new Notification({
      userUuid: companyUserUuid,
      adminUserUuid: extensionAdmin.userUuid,
      jobApplicationUuid: jobApplication.uuid
    });
    await NotificationRepository.save(notification);
    const notifications = await NotificationRepository.findAll();
    expect(notifications.map(({ uuid }) => uuid)).toEqual(
      expect.arrayContaining([notification.uuid])
    );
  });

  it("throws an error if the notification has an existing uuid", async () => {
    const attributes = {
      uuid: UUID.generate(),
      userUuid: companyUserUuid,
      adminUserUuid: extensionAdmin.userUuid,
      jobApplicationUuid: jobApplication.uuid
    };
    const notification = new Notification(attributes);
    const existentNotification = new Notification(attributes);

    await NotificationRepository.save(notification);
    await expect(NotificationRepository.save(existentNotification)).rejects.toThrowErrorWithMessage(
      UniqueConstraintError,
      "Validation error"
    );
  });

  it("throws an error if the jobApplicationUuid does not belong to an existing jobApplication", async () => {
    const notification = new Notification({
      userUuid: companyUserUuid,
      adminUserUuid: extensionAdmin.userUuid,
      jobApplicationUuid: UUID.generate()
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_jobApplicationUuid_fkey"'
    );
  });

  it("throws an error if the userUuid does not belong to an existing user", async () => {
    const notification = new Notification({
      userUuid: UUID.generate(),
      adminUserUuid: extensionAdmin.userUuid,
      jobApplicationUuid: jobApplication.uuid
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_userUuid_fkey"'
    );
  });

  it("throws an error if the adminUserUuid does not belong to an existing admin", async () => {
    const notification = new Notification({
      userUuid: companyUserUuid,
      adminUserUuid: UUID.generate(),
      jobApplicationUuid: jobApplication.uuid
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_adminUserUuid_fkey"'
    );
  });

  it("deletes all notifications if JobApplications table is truncated", async () => {
    await NotificationRepository.truncate();
    await NotificationRepository.save(
      new Notification({
        userUuid: companyUserUuid,
        adminUserUuid: extensionAdmin.userUuid,
        jobApplicationUuid: jobApplication.uuid
      })
    );
    expect(await NotificationRepository.findAll()).toHaveLength(1);
    await JobApplicationRepository.truncate();
    expect(await NotificationRepository.findAll()).toHaveLength(0);
  });

  it("finds all notification for all users", async () => {
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    await NotificationGenerator.instance.JobApplication.list({ company, size: 2 });
    await NotificationGenerator.instance.JobApplication.list({ company: anotherCompany, size: 2 });
    const allNotifications = await NotificationRepository.findAll();
    expect(allNotifications).toHaveLength(4);
  });
});
