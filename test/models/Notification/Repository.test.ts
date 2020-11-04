import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { Admin, Applicant, Notification } from "$models";
import { UserRepository } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { NotificationRepository } from "$models/Notification";

import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";

import generateUuid from "uuid/v4";

describe("NotificationRepository", () => {
  beforeAll(() => UserRepository.truncate());

  describe("Notification for an applicant", () => {
    let applicant: Applicant;
    let extensionAdmin: Admin;

    beforeAll(async () => {
      applicant = await ApplicantGenerator.instance.withMinimumData();
      extensionAdmin = await AdminGenerator.extension();
    });

    it("saves a notification in the database", async () => {
      const notification = new Notification({
        userUuid: applicant.userUuid,
        adminUserUuid: extensionAdmin.userUuid,
        applicantUuid: applicant.uuid
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
        userUuid: applicant.userUuid,
        adminUserUuid: extensionAdmin.userUuid,
        applicantUuid: applicant.uuid
      };
      const notification = new Notification(attributes);
      const existentNotification = new Notification(attributes);

      await NotificationRepository.save(notification);
      await expect(
        NotificationRepository.save(existentNotification)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error if the applicantUuid does not belong to an existing applicant", async () => {
      const notification = new Notification({
        userUuid: applicant.userUuid,
        adminUserUuid: extensionAdmin.userUuid,
        applicantUuid: generateUuid()
      });
      await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "Notifications" violates foreign key ' +
          'constraint "Notifications_applicantUuid_fkey"'
      );
    });

    it("throws an error if the userUuid does not belong to an existing user", async () => {
      const notification = new Notification({
        userUuid: generateUuid(),
        adminUserUuid: extensionAdmin.userUuid,
        applicantUuid: applicant.uuid
      });
      await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "Notifications" violates foreign key ' +
          'constraint "Notifications_userUuid_fkey"'
      );
    });

    it("throws an error if the adminUserUuid does not belong to an existing admin", async () => {
      const notification = new Notification({
        userUuid: applicant.userUuid,
        adminUserUuid: generateUuid(),
        applicantUuid: applicant.uuid
      });
      await expect(NotificationRepository.save(notification)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "Notifications" violates foreign key ' +
          'constraint "Notifications_adminUserUuid_fkey"'
      );
    });

    it("deletes all notifications if applicants tables is truncated", async () => {
      await NotificationRepository.truncate();
      await NotificationRepository.save(
        new Notification({
          userUuid: applicant.userUuid,
          adminUserUuid: extensionAdmin.userUuid,
          applicantUuid: applicant.uuid
        })
      );
      expect(await NotificationRepository.findAll()).toHaveLength(1);
      await ApplicantRepository.truncate();
      expect(await NotificationRepository.findAll()).toHaveLength(0);
    });
  });
});
