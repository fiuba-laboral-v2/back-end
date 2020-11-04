import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { Admin, JobApplication, Notification } from "$models";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { JobApplicationRepository } from "$models/JobApplication";
import { CareerRepository } from "$models/Career";
import { NotificationRepository } from "$models/Notification";

import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";

import generateUuid from "uuid/v4";

describe("NotificationRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  describe("Notification for a JobApplication", () => {
    let jobApplication: JobApplication;
    let companyUserUuid: string;
    let extensionAdmin: Admin;

    beforeAll(async () => {
      jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const [user] = await (await (await jobApplication.getOffer()).getCompany()).getUsers();
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

    it("throws an error if the notification already exists", async () => {
      const attributes = {
        uuid: generateUuid(),
        userUuid: companyUserUuid,
        adminUserUuid: extensionAdmin.userUuid,
        jobApplicationUuid: jobApplication.uuid
      };
      const notification = new Notification(attributes);
      const existentNotification = new Notification(attributes);

      await NotificationRepository.save(notification);
      await expect(
        NotificationRepository.save(existentNotification)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error if the jobApplicationUuid does not belong to an existing jobApplication", async () => {
      const notification = new Notification({
        userUuid: companyUserUuid,
        adminUserUuid: extensionAdmin.userUuid,
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
        userUuid: generateUuid(),
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
        adminUserUuid: generateUuid(),
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
  });
});
