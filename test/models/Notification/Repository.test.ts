import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { Admin, Company, JobApplication, Notification, User } from "$models";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { CareerRepository } from "$models/Career";
import { NotificationRepository, NotificationsNotUpdatedError } from "$models/Notification";

import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { NotificationGenerator } from "$generators/Notification";
import { AdminGenerator } from "$generators/Admin";

import generateUuid from "uuid/v4";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { range } from "lodash";
import MockDate from "mockdate";
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
      receiverUuid: companyUserUuid,
      senderUuid: extensionAdmin.userUuid,
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
      uuid: generateUuid(),
      receiverUuid: companyUserUuid,
      senderUuid: extensionAdmin.userUuid,
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
      receiverUuid: companyUserUuid,
      senderUuid: extensionAdmin.userUuid,
      jobApplicationUuid: generateUuid()
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_jobApplicationUuid_fkey"'
    );
  });

  it("throws an error if the userUuid does not belong to an existing user", async () => {
    const notification = new Notification({
      receiverUuid: generateUuid(),
      senderUuid: extensionAdmin.userUuid,
      jobApplicationUuid: jobApplication.uuid
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_receiverUuid_fkey"'
    );
  });

  it("throws an error if the senderUuid does not belong to an existing admin", async () => {
    const notification = new Notification({
      receiverUuid: companyUserUuid,
      senderUuid: generateUuid(),
      jobApplicationUuid: jobApplication.uuid
    });
    await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "Notifications" violates foreign key ' +
        'constraint "Notifications_senderUuid_fkey"'
    );
  });

  it("deletes all notifications if JobApplications table is truncated", async () => {
    await NotificationRepository.truncate();
    await NotificationRepository.save(
      new Notification({
        receiverUuid: companyUserUuid,
        senderUuid: extensionAdmin.userUuid,
        jobApplicationUuid: jobApplication.uuid
      })
    );
    expect(await NotificationRepository.findAll()).toHaveLength(1);
    await JobApplicationRepository.truncate();
    expect(await NotificationRepository.findAll()).toHaveLength(0);
  });

  describe("markAsReadByUuids", () => {
    it("updates isNew to false for all given notification uuids", async () => {
      const size = 4;
      const notifications = await NotificationGenerator.instance.JobApplication.list({
        company,
        size
      });
      const notificationUuids = notifications.map(({ uuid }) => uuid);

      expect(notifications.map(({ isNew }) => isNew)).toEqual(Array(size).fill(true));
      await NotificationRepository.markAsReadByUuids(notificationUuids);
      const updatedNotifications = await NotificationRepository.findByUuids(notificationUuids);
      expect(updatedNotifications.map(({ isNew }) => isNew)).toEqual(Array(size).fill(false));
    });

    it("throws an error if one of the given uuids does not belong to a persisted notification", async () => {
      const { uuid } = await NotificationGenerator.instance.JobApplication.approved(company);
      const nonExistentUuid = generateUuid();
      await expect(
        NotificationRepository.markAsReadByUuids([uuid, nonExistentUuid])
      ).rejects.toThrowErrorWithMessage(
        NotificationsNotUpdatedError,
        NotificationsNotUpdatedError.buildMessage()
      );
    });

    it("does not update the notifications if it throws an error", async () => {
      const notification = await NotificationGenerator.instance.JobApplication.approved(company);
      const nonExistentUuid = generateUuid();
      const uuids = [notification.uuid, nonExistentUuid];
      await expect(NotificationRepository.markAsReadByUuids(uuids)).rejects.toThrow(
        NotificationsNotUpdatedError
      );
      const persistedNotification = await NotificationRepository.findByUuid(notification.uuid);
      expect(persistedNotification).toBeObjectContaining({
        uuid: notification.uuid,
        isNew: notification.isNew,
        message: notification.message,
        senderUuid: notification.senderUuid,
        receiverUuid: notification.receiverUuid,
        jobApplicationUuid: notification.jobApplicationUuid,
        createdAt: notification.createdAt
      });
    });
  });

  describe("findAll", () => {
    let notifications: Notification[] = [];
    let anotherCompany: Company;
    const notificationsLength = 20;
    const anotherCompanyNotificationsLength = 2;
    let receiverUuid: string;

    const createNotifications = async ({ aCompany, size }: { size: number; aCompany: Company }) => {
      const values: Notification[] = [];
      for (const milliseconds of range(size)) {
        MockDate.set(milliseconds);
        values.push(await NotificationGenerator.instance.JobApplication.approved(aCompany));
        MockDate.reset();
      }
      return values.sort(({ createdAt }) => -createdAt);
    };

    beforeAll(async () => {
      await NotificationRepository.truncate();

      receiverUuid = companyUsers[0].uuid;
      anotherCompany = await CompanyGenerator.instance.withMinimumData();

      await createNotifications({
        aCompany: anotherCompany,
        size: anotherCompanyNotificationsLength
      });
      notifications = await createNotifications({ aCompany: company, size: notificationsLength });
    });

    it("finds all notification for all users", async () => {
      const allNotifications = await NotificationRepository.findAll();
      expect(allNotifications).toHaveLength(
        notificationsLength + anotherCompanyNotificationsLength
      );
    });

    it("finds all notifications by userUuid", async () => {
      const { shouldFetchMore, results } = await NotificationRepository.findLatestByUser({
        receiverUuid
      });
      expect(results).toHaveLength(notificationsLength);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the first three notifications", async () => {
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[0].createdAt,
        uuid: notifications[0].uuid
      };

      const { shouldFetchMore, results } = await NotificationRepository.findLatestByUser({
        receiverUuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications for a company user", async () => {
      const itemsPerPage = notificationsLength / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[itemsPerPage - 1].createdAt,
        uuid: notifications[itemsPerPage - 1].uuid
      };

      const { shouldFetchMore, results } = await NotificationRepository.findLatestByUser({
        receiverUuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the latest notifications order by inNew first", async () => {
      let isNew = true;
      notifications.map(notification => {
        notification.isNew = !isNew;
        isNew = !isNew;
      });
      await Promise.all(
        notifications.map(notification => NotificationRepository.save(notification))
      );
      const { shouldFetchMore, results } = await NotificationRepository.findLatestByUser({
        receiverUuid
      });
      expect(results.map(result => result.isNew)).toEqual([
        ...Array(notificationsLength / 2).fill(true),
        ...Array(notificationsLength / 2).fill(false)
      ]);
      expect(shouldFetchMore).toBe(false);
    });
  });
});
