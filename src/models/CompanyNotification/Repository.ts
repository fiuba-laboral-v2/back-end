import { Database } from "$config/Database";
import {
  CompanyNotification,
  CompanyNotificationMapper,
  CompanyNotificationType,
  RejectedOfferCompanyNotification,
  RejectedProfileCompanyNotification
} from "$models/CompanyNotification";
import { CompanyNotificationSequelizeModel } from "$models";
import { CompanyNotificationNotFoundError, CompanyNotificationsNotUpdatedError } from "./Errors";
import { Op, Transaction } from "sequelize";
import { IFindLatestByCompany, IHasUnreadNotifications } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";
import { DateTimeManager } from "$libs/DateTimeManager";
import { CleanupConfig } from "$config";

export const CompanyNotificationRepository = {
  save: async (notification: CompanyNotification, transaction?: Transaction) => {
    const random = Math.random();
    const companyNotification = CompanyNotificationMapper.toPersistenceModel(notification);
    await Database.transaction(async internalTransaction => {
      const finalTransaction = transaction || internalTransaction;
      if (random < 0.001) await CompanyNotificationRepository.cleanupOldEntries(finalTransaction);
      await companyNotification.save({ transaction: finalTransaction });
    });
    notification.setUuid(companyNotification.uuid);
    notification.setCreatedAt(companyNotification.createdAt);
  },
  cleanupOldEntries: async (transaction?: Transaction) => {
    const thresholdDate = DateTimeManager.monthsAgo(CleanupConfig.thresholdInMonths());
    await CompanyNotificationSequelizeModel.destroy({
      where: { createdAt: { [Op.lte]: thresholdDate } },
      transaction
    });
  },
  hasUnreadNotifications: async ({ companyUuid }: IHasUnreadNotifications) => {
    const [{ exists }] = await Database.query<Array<{ exists: boolean }>>(
      `
      SELECT EXISTS (
        SELECT *
         FROM "CompanyNotifications"
         WHERE "CompanyNotifications"."notifiedCompanyUuid" = '${companyUuid}'
         AND "CompanyNotifications"."isNew" = true
       )
    `,
      { type: "SELECT" }
    );
    return exists;
  },
  findLastRejectedOfferNotification: async (offerUuid: string) => {
    const notifications = await CompanyNotificationSequelizeModel.findAll({
      where: {
        offerUuid,
        type: CompanyNotificationType.rejectedOffer
      },
      order: [["createdAt", "DESC"]]
    });
    if (notifications.length === 0) throw new CompanyNotificationNotFoundError();

    const notification = CompanyNotificationMapper.toDomainModel(notifications[0]);
    return notification as RejectedOfferCompanyNotification;
  },
  findLastRejectedProfileNotification: async (notifiedCompanyUuid: string) => {
    const notifications = await CompanyNotificationSequelizeModel.findAll({
      where: {
        notifiedCompanyUuid,
        type: CompanyNotificationType.rejectedProfile
      },
      order: [["createdAt", "DESC"]]
    });
    if (notifications.length === 0) throw new CompanyNotificationNotFoundError();

    const notification = CompanyNotificationMapper.toDomainModel(notifications[0]);
    return notification as RejectedProfileCompanyNotification;
  },
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await CompanyNotificationSequelizeModel.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedCount !== uuids.length) throw new CompanyNotificationsNotUpdatedError();
    }),
  findLatestByCompany: ({ updatedBeforeThan, companyUuid }: IFindLatestByCompany) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { notifiedCompanyUuid: companyUuid },
      timestampKey: "createdAt",
      query: async options => {
        const companyNotifications = await CompanyNotificationSequelizeModel.findAll(options);
        return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
      }
    }),
  findByUuids: async (uuids: string[]) => {
    const companyNotifications = await CompanyNotificationSequelizeModel.findAll({
      where: { uuid: uuids }
    });
    return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
  },
  findByUuid: async (uuid: string) => {
    const companyNotification = await CompanyNotificationSequelizeModel.findByPk(uuid);
    if (!companyNotification) throw new CompanyNotificationNotFoundError(uuid);

    return CompanyNotificationMapper.toDomainModel(companyNotification);
  },
  findAll: async () => {
    const companyNotifications = await CompanyNotificationSequelizeModel.findAll();
    return companyNotifications.map(companyNotification =>
      CompanyNotificationMapper.toDomainModel(companyNotification)
    );
  },
  truncate: () => CompanyNotificationSequelizeModel.destroy({ truncate: true })
};
