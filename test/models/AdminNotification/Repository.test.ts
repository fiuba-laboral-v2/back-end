import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { AdminNotificationNotFoundError } from "$models/AdminNotification/Errors";
import { Admin, Company } from "$models";
import {
  UpdatedCompanyProfileAdminNotification,
  IUpdatedCompanyProfileNotification,
  IAdminNotificationAttributes,
  AdminNotification,
  AdminNotificationRepository
} from "$models/AdminNotification";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { UUID_REGEX } from "$test/models";
import { UUID } from "$models/UUID";

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
