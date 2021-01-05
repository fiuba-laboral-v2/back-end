import {
  ApplicantNotificationNotFoundError,
  ApplicantNotificationsNotUpdatedError
} from "./Errors";
import { ApplicantNotification, ApplicantNotificationMapper } from "$models/ApplicantNotification";
import { IFindLatestByApplicant, IHasUnreadNotifications } from "./Interfaces";
import { Transaction } from "sequelize";
import { ApplicantNotificationSequelizeModel } from "$models";
import { PaginationQuery } from "$models/PaginationQuery";
import { Database } from "$config";

export const ApplicantNotificationRepository = {
  save: async (notification: ApplicantNotification, transaction?: Transaction) => {
    const sequelizeModel = ApplicantNotificationMapper.toPersistenceModel(notification);
    await sequelizeModel.save({ transaction });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
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
