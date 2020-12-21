import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { AdminNotificationNotFoundError } from "$models/AdminNotification/Errors";
import { Admin, Company } from "$models";
import {
  UpdatedCompanyProfileAdminNotification,
  IUpdatedCompanyProfileNotification,
  IAdminNotificationAttributes,
  AdminNotification,
  AdminNotificationsNotUpdatedError,
  AdminNotificationRepository
} from "$models/AdminNotification";

import { UUID } from "$models/UUID";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { AdminNotificationGenerator } from "$generators/AdminNotification";

import { UUID_REGEX } from "$test/models";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("AdminNotificationRepository", () => {
  let extensionAdmin: Admin;
  let company: Company;
  let commonAttributes: IAdminNotificationAttributes;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CompanyRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    company = await CompanyGenerator.instance.withMinimumData();
    commonAttributes = { secretary: extensionAdmin.secretary, isNew: true };
  });

  describe("save", () => {
    const expectNotificationToBeSaved = async (notification: AdminNotification) => {
      await AdminNotificationRepository.save(notification);
      const uuid = notification.uuid!;
      const savedNotification = await AdminNotificationRepository.findByUuid(uuid);
      expect(savedNotification).toEqual(savedNotification);
    };

    const expectToGenerateUuidAfterItIsSaved = async (notification: AdminNotification) => {
      expect(notification.uuid).toBeUndefined();
      await AdminNotificationRepository.save(notification);
      expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    };

    const expectToSetACreatedAtAfterItIsSaved = async (notification: AdminNotification) => {
      expect(notification.createdAt).toBeUndefined();
      await AdminNotificationRepository.save(notification);
      expect(notification.createdAt).toEqual(expect.any(Date));
    };

    const expectToThrowErrorOnUniqueConstraint = async (notification: AdminNotification) => {
      const uuid = UUID.generate();
      jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
      await AdminNotificationRepository.save(notification);
      expect(notification.uuid).toEqual(uuid);
      const anotherNotification = new UpdatedCompanyProfileAdminNotification({
        ...commonAttributes,
        companyUuid: company.uuid
      });
      await expect(
        AdminNotificationRepository.save(anotherNotification)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    };

    const expectToThrowErrorOnForeignKeyConstraint = async (
      notification: AdminNotification,
      attributeName: string
    ) => {
      notification[attributeName] = UUID.generate();
      await expect(AdminNotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "AdminNotifications" violates foreign key ' +
          `constraint "AdminNotifications_${attributeName}_fkey"`
      );
    };

    describe("UpdatedCompanyProfileAdminNotification", () => {
      let attributes: IUpdatedCompanyProfileNotification;

      beforeAll(async () => {
        attributes = { ...commonAttributes, companyUuid: company.uuid };
      });

      it("saves the notification in the database", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await AdminNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await AdminNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the companyUuid does not belong to an existing one", async () => {
        const notification = new UpdatedCompanyProfileAdminNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "companyUuid");
      });
    });
  });

  it("throws an error if the uuid does not belong to a persisted notification", async () => {
    const uuid = UUID.generate();
    await expect(AdminNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      AdminNotificationNotFoundError,
      AdminNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("findLatestBySecretary", () => {
    const { findLatestBySecretary } = AdminNotificationRepository;
    let notifications: AdminNotification[] = [];
    const notificationsLength = 20;

    beforeAll(async () => {
      await AdminNotificationRepository.truncate();

      const size = notificationsLength;
      const admin = extensionAdmin;
      const graduadosAdmin = await AdminGenerator.graduados();
      notifications = await AdminNotificationGenerator.instance.range({ admin, size });
      await AdminNotificationGenerator.instance.range({ admin: graduadosAdmin, size: 2 });
    });

    it("finds all notifications by secretary", async () => {
      const secretary = extensionAdmin.secretary;
      const result = await findLatestBySecretary({ secretary });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(notificationsLength);
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the first three notifications", async () => {
      const secretary = extensionAdmin.secretary;
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[0].createdAt!,
        uuid: notifications[0].uuid!
      };
      const result = await findLatestBySecretary({ updatedBeforeThan, secretary });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(itemsPerPage);
      expect(results).toEqual(notifications.slice(1, itemsPerPage + 1));
      expect(shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications", async () => {
      const secretary = extensionAdmin.secretary;
      const itemsPerPage = notificationsLength / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: notifications[itemsPerPage - 1].createdAt!,
        uuid: notifications[itemsPerPage - 1].uuid!
      };
      const result = await findLatestBySecretary({ updatedBeforeThan, secretary });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(itemsPerPage);
      expect(results).toEqual(notifications.slice(itemsPerPage, notificationsLength + 1));
      expect(shouldFetchMore).toBe(false);
    });

    it("finds the latest notifications order by inNew first", async () => {
      const secretary = extensionAdmin.secretary;
      let isNew = true;
      notifications.forEach(notification => {
        notification.isNew = !isNew;
        isNew = !isNew;
      });
      await Promise.all(
        notifications.map(notification => AdminNotificationRepository.save(notification))
      );
      const { shouldFetchMore, results } = await findLatestBySecretary({ secretary });

      expect(results.map(result => result.isNew)).toEqual([
        ...Array(notificationsLength / 2).fill(true),
        ...Array(notificationsLength / 2).fill(false)
      ]);
      expect(shouldFetchMore).toBe(false);
    });
  });

  describe("markAsReadByUuids", () => {
    it("updates isNew to false for all given notification uuids", async () => {
      const size = 4;
      const generator = AdminNotificationGenerator.instance.range;
      const notifications = await generator({ admin: extensionAdmin, size });
      notifications.map(notification => expect(notification.isNew).toBe(true));

      const uuids = notifications.map(({ uuid }) => uuid!);
      await AdminNotificationRepository.markAsReadByUuids(uuids);
      const updatedNotifications = await AdminNotificationRepository.findByUuids(uuids);
      updatedNotifications.map(notification => expect(notification.isNew).toBe(false));
    });

    it("throws an error if one of the given uuids does not exist", async () => {
      const nonExistentUuid = UUID.generate();
      const generator = AdminNotificationGenerator.instance.updatedCompanyProfile;
      const notification = await generator({ admin: extensionAdmin });
      const uuids = [nonExistentUuid, notification.uuid!];
      await expect(
        AdminNotificationRepository.markAsReadByUuids(uuids)
      ).rejects.toThrowErrorWithMessage(
        AdminNotificationsNotUpdatedError,
        AdminNotificationsNotUpdatedError.buildMessage()
      );
    });

    it("does not update the notifications if it throws an error", async () => {
      const nonExistentUuid = UUID.generate();
      const generator = AdminNotificationGenerator.instance.updatedCompanyProfile;
      const notification = await generator({ admin: extensionAdmin });
      const uuid = notification.uuid!;
      const uuids = [nonExistentUuid, uuid];
      await expect(AdminNotificationRepository.markAsReadByUuids(uuids)).rejects.toThrowError();
      const persistedNotification = await AdminNotificationRepository.findByUuid(uuid);
      expect(persistedNotification.isNew).toEqual(true);
    });
  });

  describe("hasUnreadNotifications", () => {
    beforeEach(() => AdminNotificationRepository.truncate());

    it("returns true if there are unread notifications", async () => {
      const size = 4;
      const generator = AdminNotificationGenerator.instance.range;
      const notifications = await generator({ admin: extensionAdmin, size });
      let isNew = true;
      for (const notification of notifications) {
        notification.isNew = !isNew;
        isNew = !isNew;
        await AdminNotificationRepository.save(notification);
      }
      const hasUnreadNotifications = await AdminNotificationRepository.hasUnreadNotifications({
        secretary: extensionAdmin.secretary
      });
      expect(hasUnreadNotifications).toBe(true);
    });

    it("returns false if all notifications were read", async () => {
      const size = 4;
      const generator = AdminNotificationGenerator.instance.range;
      const notifications = await generator({ admin: extensionAdmin, size });
      notifications.map(notification => (notification.isNew = false));
      await Promise.all(notifications.map(n => AdminNotificationRepository.save(n)));
      const hasUnreadNotifications = await AdminNotificationRepository.hasUnreadNotifications({
        secretary: extensionAdmin.secretary
      });
      expect(hasUnreadNotifications).toBe(false);
    });

    it("returns false there is no notifications", async () => {
      const hasUnreadNotifications = await AdminNotificationRepository.hasUnreadNotifications({
        secretary: extensionAdmin.secretary
      });
      expect(hasUnreadNotifications).toBe(false);
    });
  });

  describe("DELETE CASCADE", () => {
    const updatedCompanyProfileAdminNotificationAttributes = () => ({
      secretary: extensionAdmin.secretary,
      companyUuid: company.uuid
    });

    it("deletes all notifications if Companies table is truncated", async () => {
      await AdminNotificationRepository.truncate();
      const attributes = updatedCompanyProfileAdminNotificationAttributes();
      const firstNotification = new UpdatedCompanyProfileAdminNotification(attributes);
      const secondNotification = new UpdatedCompanyProfileAdminNotification(attributes);
      await AdminNotificationRepository.save(firstNotification);
      await AdminNotificationRepository.save(secondNotification);
      expect(await AdminNotificationRepository.findAll()).toHaveLength(2);
      await CompanyRepository.truncate();
      expect(await AdminNotificationRepository.findAll()).toHaveLength(0);
    });
  });
});
