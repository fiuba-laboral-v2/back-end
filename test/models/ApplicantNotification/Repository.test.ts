import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import {
  ApplicantNotificationNotFoundError,
  ApplicantNotificationsNotUpdatedError
} from "$models/ApplicantNotification/Errors";
import { Admin, Applicant, Company, JobApplication } from "$models";
import {
  IApprovedJobApplicationAttributes,
  IRejectedJobApplicationAttributes,
  IApplicantNotificationAttributes,
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  IApprovedProfileAttributes,
  RejectedProfileApplicantNotification,
  IRejectedProfileAttributes,
  PendingJobApplicationApplicantNotification,
  IPendingJobApplicationAttributes,
  ApplicantNotificationRepository,
  ApplicantNotification
} from "$models/ApplicantNotification";
import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";
import { UUID_REGEX } from "$test/models";
import { UUID } from "$models/UUID";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { DateTimeManager } from "$libs/DateTimeManager";
import { CleanupConfig } from "$config";

describe("ApplicantNotificationRepository", () => {
  let extensionAdmin: Admin;
  let applicant: Applicant;
  let company: Company;
  let jobApplication: JobApplication;
  let commonAttributes: IApplicantNotificationAttributes;

  beforeAll(async () => {
    await UserRepository.truncate();
    await ApplicantRepository.truncate();
    await CareerRepository.truncate();
    await CompanyRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    applicant = await ApplicantGenerator.instance.withMinimumData();
    company = await CompanyGenerator.instance.withMinimumData();
    jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
    commonAttributes = {
      moderatorUuid: extensionAdmin.userUuid,
      notifiedApplicantUuid: applicant.uuid,
      isNew: true
    };
  });

  beforeEach(() => {
    jest.spyOn(Math, "random").mockImplementation(() => 0.5);
  });

  describe("save", () => {
    const expectNotificationToBeSaved = async (notification: ApplicantNotification) => {
      await ApplicantNotificationRepository.save(notification);
      const uuid = notification.uuid!;
      const savedNotification = await ApplicantNotificationRepository.findByUuid(uuid);
      expect(savedNotification).toEqual(savedNotification);
    };

    const expectToGenerateUuidAfterItIsSaved = async (notification: ApplicantNotification) => {
      expect(notification.uuid).toBeUndefined();
      await ApplicantNotificationRepository.save(notification);
      expect(notification.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    };

    const expectToSetACreatedAtAfterItIsSaved = async (notification: ApplicantNotification) => {
      expect(notification.createdAt).toBeUndefined();
      await ApplicantNotificationRepository.save(notification);
      expect(notification.createdAt).toEqual(expect.any(Date));
    };

    const expectToThrowErrorOnUniqueConstraint = async (notification: ApplicantNotification) => {
      const uuid = UUID.generate();
      jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
      await ApplicantNotificationRepository.save(notification);
      expect(notification.uuid).toEqual(uuid);
      const anotherNotification = new ApprovedJobApplicationApplicantNotification({
        ...commonAttributes,
        jobApplicationUuid: jobApplication.uuid
      });
      await expect(
        ApplicantNotificationRepository.save(anotherNotification)
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    };

    const expectToThrowErrorOnForeignKeyConstraint = async (
      notification: ApplicantNotification,
      attributeName: string
    ) => {
      notification[attributeName] = UUID.generate();
      await expect(
        ApplicantNotificationRepository.save(notification)
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "ApplicantNotifications" violates foreign key ' +
          `constraint "ApplicantNotifications_${attributeName}_fkey"`
      );
    };

    describe("", () => {
      let firstNotification: PendingJobApplicationApplicantNotification;
      let secondNotification: ApprovedProfileApplicantNotification;

      beforeAll(async () => {
        firstNotification = new PendingJobApplicationApplicantNotification({
          ...commonAttributes,
          jobApplicationUuid: jobApplication.uuid
        });
        secondNotification = new ApprovedProfileApplicantNotification(commonAttributes);
      });

      it("deletes all notifications that are older than the months by config ago", async () => {
        await ApplicantNotificationRepository.truncate();
        const generator = ApplicantNotificationGenerator.instance;
        const createdAt = DateTimeManager.monthsAgo(CleanupConfig.thresholdInMonths() * 2);
        await generator.range({ applicant, size: 10, mockDate: createdAt });

        await ApplicantNotificationRepository.save(firstNotification);
        jest.spyOn(Math, "random").mockImplementation(() => 0.01);
        await ApplicantNotificationRepository.save(secondNotification);
        const notifications = await ApplicantNotificationRepository.findAll();
        const notificationUuids = notifications.map(({ uuid }) => uuid!);

        expect(notifications).toHaveLength(2);
        expect(notificationUuids).toEqual(
          expect.arrayContaining([firstNotification.uuid, secondNotification.uuid])
        );
      });
    });

    describe("PendingJobApplicationApplicantNotification", () => {
      let attributes: IPendingJobApplicationAttributes;

      beforeAll(async () => {
        attributes = { ...commonAttributes, jobApplicationUuid: jobApplication.uuid };
      });

      it("saves the notification in the database", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the jobApplicationUuid does not belong to an existing one", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "jobApplicationUuid");
      });

      it("throws an error if the moderatorUuid does not belong to an existing admin", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "moderatorUuid");
      });

      it("throws an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
        const notification = new PendingJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "notifiedApplicantUuid");
      });
    });

    describe("ApprovedJobApplicationApplicantNotification", () => {
      let attributes: IApprovedJobApplicationAttributes;

      beforeAll(async () => {
        attributes = { ...commonAttributes, jobApplicationUuid: jobApplication.uuid };
      });

      it("saves the notification in the database", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the jobApplicationUuid does not belong to an existing one", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "jobApplicationUuid");
      });

      it("throws an error if the moderatorUuid does not belong to an existing admin", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "moderatorUuid");
      });

      it("throws an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
        const notification = new ApprovedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "notifiedApplicantUuid");
      });
    });

    describe("RejectedJobApplicationApplicantNotification", () => {
      let attributes: IRejectedJobApplicationAttributes;

      beforeAll(async () => {
        attributes = {
          ...commonAttributes,
          jobApplicationUuid: jobApplication.uuid,
          moderatorMessage: "message"
        };
      });

      it("saves the notification in the database", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the jobApplicationUuid does not belong to an existing one", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "jobApplicationUuid");
      });

      it("throws an error if the moderatorUuid does not belong to an existing admin", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "moderatorUuid");
      });

      it("throws an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
        const notification = new RejectedJobApplicationApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "notifiedApplicantUuid");
      });
    });

    describe("ApprovedProfileApplicantNotification", () => {
      let attributes: IApprovedProfileAttributes;

      beforeAll(async () => (attributes = commonAttributes));

      it("saves the notification in the database", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the moderatorUuid does not belong to an existing admin", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "moderatorUuid");
      });

      it("throws an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
        const notification = new ApprovedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "notifiedApplicantUuid");
      });
    });

    describe("RejectedProfileApplicantNotification", () => {
      let attributes: IRejectedProfileAttributes;

      beforeAll(async () => (attributes = { ...commonAttributes, moderatorMessage: "message" }));

      it("saves the notification in the database", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectNotificationToBeSaved(notification);
      });

      it("generates an uuid after it is saved", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectToGenerateUuidAfterItIsSaved(notification);
      });

      it("generates a createdAt timestamp after it is saved", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectToSetACreatedAtAfterItIsSaved(notification);
      });

      it("updates isNew to false", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(true);
        notification.isNew = false;
        await ApplicantNotificationRepository.save(notification);
        expect(notification.isNew).toBe(false);
      });

      it("throws an error if the notification already exist", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnUniqueConstraint(notification);
      });

      it("throws an error if the moderatorUuid does not belong to an existing admin", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "moderatorUuid");
      });

      it("throws an error if the notifiedApplicantUuid does not belong to an existing applicant", async () => {
        const notification = new RejectedProfileApplicantNotification(attributes);
        await expectToThrowErrorOnForeignKeyConstraint(notification, "notifiedApplicantUuid");
      });
    });
  });

  it("throws an error if the uuid does not belong to a persisted notification", async () => {
    const uuid = UUID.generate();
    await expect(ApplicantNotificationRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      ApplicantNotificationNotFoundError,
      ApplicantNotificationNotFoundError.buildMessage(uuid)
    );
  });

  describe("hasUnreadNotifications", () => {
    beforeEach(() => ApplicantNotificationRepository.truncate());

    it("returns true if there are unread notifications", async () => {
      const size = 4;
      const generator = ApplicantNotificationGenerator.instance.range;
      const notifications = await generator({ applicant, size });
      let isNew = true;
      for (const notification of notifications) {
        notification.isNew = !isNew;
        isNew = !isNew;
        await ApplicantNotificationRepository.save(notification);
      }
      const hasUnreadNotifications = await ApplicantNotificationRepository.hasUnreadNotifications({
        applicantUuid: applicant.uuid
      });
      expect(hasUnreadNotifications).toBe(true);
    });

    it("returns false if all notifications were read", async () => {
      const size = 4;
      const generator = ApplicantNotificationGenerator.instance.range;
      const notifications = await generator({ applicant, size });
      notifications.map(notification => (notification.isNew = false));
      await Promise.all(notifications.map(n => ApplicantNotificationRepository.save(n)));
      const hasUnreadNotifications = await ApplicantNotificationRepository.hasUnreadNotifications({
        applicantUuid: applicant.uuid
      });
      expect(hasUnreadNotifications).toBe(false);
    });

    it("returns false there is no notifications", async () => {
      const hasUnreadNotifications = await ApplicantNotificationRepository.hasUnreadNotifications({
        applicantUuid: applicant.uuid
      });
      expect(hasUnreadNotifications).toBe(false);
    });
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
  });

  describe("markAsReadByUuids", () => {
    it("updates isNew to false for all given notification uuids", async () => {
      const size = 4;
      const generator = ApplicantNotificationGenerator.instance.range;
      const notifications = await generator({ applicant, size });
      notifications.map(notification => expect(notification.isNew).toBe(true));

      const uuids = notifications.map(({ uuid }) => uuid!);
      await ApplicantNotificationRepository.markAsReadByUuids(uuids);
      const updatedNotifications = await ApplicantNotificationRepository.findByUuids(uuids);
      updatedNotifications.map(notification => expect(notification.isNew).toBe(false));
    });

    it("throws an error if one of the given uuids does not exist", async () => {
      const nonExistentUuid = UUID.generate();
      const generator = ApplicantNotificationGenerator.instance.approvedJobApplication;
      const notification = await generator({ applicant, admin: extensionAdmin });
      const uuids = [nonExistentUuid, notification.uuid!];
      await expect(
        ApplicantNotificationRepository.markAsReadByUuids(uuids)
      ).rejects.toThrowErrorWithMessage(
        ApplicantNotificationsNotUpdatedError,
        ApplicantNotificationsNotUpdatedError.buildMessage()
      );
    });

    it("does not update the notifications if it throws an error", async () => {
      const nonExistentUuid = UUID.generate();
      const generator = ApplicantNotificationGenerator.instance.approvedJobApplication;
      const notification = await generator({ applicant, admin: extensionAdmin });
      const uuid = notification.uuid!;
      const uuids = [nonExistentUuid, uuid];
      await expect(ApplicantNotificationRepository.markAsReadByUuids(uuids)).rejects.toThrowError();
      const persistedNotification = await ApplicantNotificationRepository.findByUuid(uuid);
      expect(persistedNotification.isNew).toEqual(true);
    });
  });

  describe("findLastRejectedJobApplicationNotification", () => {
    const generator = ApplicantNotificationGenerator.instance;
    const { findLastRejectedJobApplicationNotification } = ApplicantNotificationRepository;

    it("returns the newest rejectedJobApplication notification by JobApplicationUuid", async () => {
      const firstNotification = await generator.rejectedJobApplication({ jobApplication });
      const secondNotification = await generator.rejectedJobApplication({ jobApplication });
      await generator.approvedJobApplication({ jobApplication });

      expect(firstNotification.createdAt!.getTime()).toBeLessThan(
        secondNotification.createdAt!.getTime()
      );
      const notification = await findLastRejectedJobApplicationNotification(jobApplication.uuid);
      expect(notification.uuid).toEqual(secondNotification.uuid);
    });

    it("returns an instance of RejectedJobApplicationApplicantNotification", async () => {
      await generator.rejectedJobApplication({ jobApplication });
      await generator.rejectedJobApplication({ jobApplication });
      await generator.approvedJobApplication({ jobApplication });
      const notification = await findLastRejectedJobApplicationNotification(jobApplication.uuid);
      expect(notification).toBeInstanceOf(RejectedJobApplicationApplicantNotification);
    });

    it("throws an error if the jobApplicationUuid does not belong to a persisted notification", async () => {
      await expect(
        findLastRejectedJobApplicationNotification(UUID.generate())
      ).rejects.toThrowErrorWithMessage(
        ApplicantNotificationNotFoundError,
        ApplicantNotificationNotFoundError.buildMessage()
      );
    });
  });

  describe("findLastRejectedProfileNotification", () => {
    const generator = ApplicantNotificationGenerator.instance;
    const { findLastRejectedProfileNotification } = ApplicantNotificationRepository;

    it("returns the newest rejectedProfile notification by notifiedApplicantUuid", async () => {
      await generator.rejectedJobApplication({});
      await generator.rejectedJobApplication({});
      const thirdNotification = await generator.rejectedProfile({ applicant });
      const fourthNotification = await generator.rejectedProfile({ applicant });
      await generator.rejectedProfile({});
      await generator.approvedJobApplication({ jobApplication });

      expect(thirdNotification.createdAt!.getTime()).toBeLessThan(
        fourthNotification.createdAt!.getTime()
      );
      const notification = await findLastRejectedProfileNotification(applicant.uuid);
      expect(notification.uuid).toEqual(fourthNotification.uuid);
    });

    it("returns an instance of RejectedProfileApplicantNotification", async () => {
      await generator.rejectedJobApplication({});
      await generator.rejectedProfile({ applicant });
      await generator.rejectedProfile({ applicant });
      const notification = await findLastRejectedProfileNotification(applicant.uuid);
      expect(notification).toBeInstanceOf(RejectedProfileApplicantNotification);
    });

    it("throws an error if the notifiedApplicantUuid does not belong to a persisted notification", async () => {
      await expect(
        findLastRejectedProfileNotification(UUID.generate())
      ).rejects.toThrowErrorWithMessage(
        ApplicantNotificationNotFoundError,
        ApplicantNotificationNotFoundError.buildMessage()
      );
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
