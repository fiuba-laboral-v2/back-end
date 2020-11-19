import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { v4 as generateUuid } from "uuid";
import { UUID } from "$models/UUID";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationRepository } from "$models/JobApplication";
import { TCompanyNotification } from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { Admin, Company, JobApplication } from "$models";
import { CompanyNotificationNotFoundError } from "$models/CompanyNotification/Errors";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { UUID_REGEX } from "$test/models";

describe("CompanyNotificationRepository", () => {
  let extensionAdmin: Admin;
  let company: Company;
  let jobApplication: JobApplication;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
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
      isNew: true
    };
    attributes[attributeName] = generateUuid();
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
      isNew: true
    };
    const notification = new CompanyNewJobApplicationNotification(attributes);
    await CompanyNotificationRepository.save(notification);
    const savedNotification = await CompanyNotificationRepository.findByUuid(notification.uuid!);
    expect(savedNotification).toEqual(notification);
    expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    expect(notification.createdAt).toEqual(expect.any(Date));
  });

  it("sets an uuid and a createdAt after it is persisted", async () => {
    const notification = new CompanyNewJobApplicationNotification({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true
    });
    expect(notification.uuid).toBeUndefined();
    expect(notification.createdAt).toBeUndefined();
    await CompanyNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    expect(notification.createdAt).toEqual(expect.any(Date));
  });

  it("updates isNew to false", async () => {
    const notification = new CompanyNewJobApplicationNotification({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid
    });
    await CompanyNotificationRepository.save(notification);
    const uuid = notification.uuid!;
    expect(notification.isNew).toBe(true);
    notification.isNew = false;
    await CompanyNotificationRepository.save(notification);
    const persistedNotification = await CompanyNotificationRepository.findByUuid(uuid);
    expect(persistedNotification.isNew).toBe(false);
  });

  it("throws an error if the notification already exist", async () => {
    const attributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true
    };
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
    const notification = new CompanyNewJobApplicationNotification(attributes);
    await CompanyNotificationRepository.save(notification);
    expect(notification.uuid).toEqual(uuid);
    const anotherNotification = new CompanyNewJobApplicationNotification(attributes);
    await expect(
      CompanyNotificationRepository.save(anotherNotification)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
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
    const uuid = generateUuid();
    await expect(CompanyNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      CompanyNotificationNotFoundError,
      CompanyNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("findLatestByUser", () => {
    let notifications: TCompanyNotification[] = [];
    const notificationsLength = 20;

    beforeAll(async () => {
      await CompanyNotificationRepository.truncate();

      const size = notificationsLength;
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();

      notifications = await CompanyNotificationGenerator.instance.range({ company, size });
      await CompanyNotificationGenerator.instance.range({ company: anotherCompany, size: 2 });
    });

    it("finds all notifications by company", async () => {
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid
      });
      expect(results).toHaveLength(notificationsLength);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the first three notifications", async () => {
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[0].createdAt!,
        uuid: notifications[0].uuid!
      };
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications", async () => {
      const itemsPerPage = notificationsLength / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[itemsPerPage - 1].createdAt!,
        uuid: notifications[itemsPerPage - 1].uuid!
      };
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid,
        updatedBeforeThan
      });
      expect(results).toHaveLength(itemsPerPage);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the latest notifications order by inNew first", async () => {
      let isNew = true;
      notifications.forEach(notification => {
        notification.isNew = !isNew;
        isNew = !isNew;
      });
      await Promise.all(
        notifications.map(notification => CompanyNotificationRepository.save(notification))
      );
      const { shouldFetchMore, results } = await CompanyNotificationRepository.findLatestByCompany({
        companyUuid: company.uuid
      });
      expect(results.map(result => result.isNew)).toEqual([
        ...Array(notificationsLength / 2).fill(true),
        ...Array(notificationsLength / 2).fill(false)
      ]);
      expect(shouldFetchMore).toBe(false);
    });
  });

  describe("Delete Cascade", () => {
    const attributes = () => ({
      moderatorUuid: extensionAdmin.userUuid,
      notifiedCompanyUuid: company.uuid,
      jobApplicationUuid: jobApplication.uuid,
      isNew: true
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
