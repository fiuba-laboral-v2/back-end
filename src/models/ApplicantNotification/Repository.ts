import {
  ApplicantNotificationNotFoundError,
  ApplicantNotificationsNotUpdatedError
} from "./Errors";
import {
  ApplicantNotification,
  ApplicantNotificationMapper,
  ApplicantNotificationType,
  RejectedJobApplicationApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";
import { IFindLatestByApplicant, IHasUnreadNotifications } from "./Interfaces";
import { Op, Transaction } from "sequelize";
import { ApplicantNotificationSequelizeModel } from "$models";
import { PaginationQuery } from "$models/PaginationQuery";
import { CleanupConfig, Database } from "$config";
import { DateTimeManager } from "$libs/DateTimeManager";

export const ApplicantNotificationRepository = {
  save: async (notification: ApplicantNotification, transaction?: Transaction) => {
    const random = Math.random();
    const sequelizeModel = ApplicantNotificationMapper.toPersistenceModel(notification);
    await Database.transaction(async internalTransaction => {
      const finalTransaction = transaction || internalTransaction;
      if (random < 0.001) await ApplicantNotificationRepository.cleanupOldEntries(finalTransaction);
      await sequelizeModel.save({ transaction: finalTransaction });
    });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
  },
  cleanupOldEntries: async (transaction?: Transaction) => {
    const thresholdDate = DateTimeManager.monthsAgo(CleanupConfig.thresholdInMonths());
    await ApplicantNotificationSequelizeModel.destroy({
      where: { createdAt: { [Op.lte]: thresholdDate } },
      transaction
    });
  },
  findLatestByApplicant: ({ applicantUuid, updatedBeforeThan }: IFindLatestByApplicant) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { notifiedApplicantUuid: applicantUuid },
      timestampKey: "createdAt",
      query: async options => {
        const notifications = await ApplicantNotificationSequelizeModel.findAll(options);
        return notifications.map(ApplicantNotificationMapper.toDomainModel);
      }
    }),
  findLastRejectedJobApplicationNotification: async (jobApplicationUuid: string) => {
    const notifications = await ApplicantNotificationSequelizeModel.findAll({
      where: {
        jobApplicationUuid,
        type: ApplicantNotificationType.rejectedJobApplication
      },
      order: [["createdAt", "DESC"]]
    });
    if (notifications.length === 0) throw new ApplicantNotificationNotFoundError();

    const notification = ApplicantNotificationMapper.toDomainModel(notifications[0]);
    return notification as RejectedJobApplicationApplicantNotification;
  },
  findLastRejectedProfileNotification: async (notifiedApplicantUuid: string) => {
    const notifications = await ApplicantNotificationSequelizeModel.findAll({
      where: {
        notifiedApplicantUuid,
        type: ApplicantNotificationType.rejectedProfile
      },
      order: [["createdAt", "DESC"]]
    });
    if (notifications.length === 0) throw new ApplicantNotificationNotFoundError();

    const notification = ApplicantNotificationMapper.toDomainModel(notifications[0]);
    return notification as RejectedProfileApplicantNotification;
  },
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await ApplicantNotificationSequelizeModel.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedCount !== uuids.length) throw new ApplicantNotificationsNotUpdatedError();
    }),
  hasUnreadNotifications: async ({ applicantUuid }: IHasUnreadNotifications) => {
    const [{ exists }] = await Database.query<Array<{ exists: boolean }>>(
      `
      SELECT EXISTS (
        SELECT *
         FROM "ApplicantNotifications"
         WHERE "ApplicantNotifications"."notifiedApplicantUuid" = '${applicantUuid}'
         AND "ApplicantNotifications"."isNew" = true
       )
    `,
      { type: "SELECT" }
    );
    return exists;
  },
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await ApplicantNotificationSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new ApplicantNotificationNotFoundError(uuid);

    return ApplicantNotificationMapper.toDomainModel(sequelizeModel);
  },
  findByUuids: async (uuids: string[]) => {
    const notifications = await ApplicantNotificationSequelizeModel.findAll({
      where: { uuid: uuids }
    });
    return notifications.map(ApplicantNotificationMapper.toDomainModel);
  },
  findAll: async () => {
    const notifications = await ApplicantNotificationSequelizeModel.findAll();
    return notifications.map(ApplicantNotificationMapper.toDomainModel);
  },
  truncate: () => ApplicantNotificationSequelizeModel.destroy({ truncate: true })
};
